import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { getCurrentAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Media from '@/models/Media';
import logger from '@/lib/logger';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key: process.env.CLOUDINARY_API_KEY ?? '',
    api_secret: process.env.CLOUDINARY_API_SECRET ?? ''
});

export const runtime = 'nodejs';

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type Category = 'electric' | 'solar' | 'plumbing';

const CategorySchema = z.enum(['electric', 'solar', 'plumbing']);
const DeleteSingleSchema = z.object({
    publicId: z.string().min(1),
    type: z.enum(['image', 'video', 'raw']).optional()
});
const DeleteMultiSchema = z.object({
    publicIds: z.array(z.string().min(1)).min(1),
    type: z.enum(['image', 'video', 'raw']).optional()
});
const DeleteBodySchema = z.union([DeleteSingleSchema, DeleteMultiSchema]);

type CloudinaryUploadResult = {
    public_id: string;
    secure_url: string;
    created_at: string;
    resource_type: 'image' | 'video' | 'raw';
};

export async function GET() {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(admin);
}

export async function POST(req: Request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const form = await req.formData();
        const categoryRaw = (form.get('category') as string | null) ?? 'plumbing';
        const parsedCategory = CategorySchema.safeParse(categoryRaw.toLowerCase());
        const category: Category = parsedCategory.success ? parsedCategory.data : 'plumbing';

        const pickedFiles: File[] = [];
        const multi = form.getAll('files').filter(Boolean) as File[];
        if (multi.length) pickedFiles.push(...multi);
        const single = form.get('file') as File | null;
        if (single) pickedFiles.push(single);

        if (pickedFiles.length === 0) return NextResponse.json({ error: 'No file' }, { status: 400 });

        for (const f of pickedFiles) {
            if (f.size > MAX_BYTES) {
                return NextResponse.json({ error: `File too large. Max ${MAX_MB}MB.` }, { status: 413 });
            }
        }

        const uploadOne = async (f: File): Promise<CloudinaryUploadResult> => {
            const buffer = Buffer.from(await f.arrayBuffer());
            return await new Promise<CloudinaryUploadResult>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: `nextgen/${category}`, resource_type: 'auto', use_filename: true },
                    (error, result) => {
                        if (error || !result) return reject(error ?? new Error('Upload failed'));
                        resolve(result as CloudinaryUploadResult);
                    }
                );
                stream.end(buffer);
            });
        };

        const results = await Promise.all(pickedFiles.map(uploadOne));

        await connectDB();
        const docs = await Media.insertMany(
            results.map((uploaded) => ({
                publicId: uploaded.public_id,
                url: uploaded.secure_url,
                type: uploaded.resource_type === 'video' ? 'video' : uploaded.resource_type === 'image' ? 'image' : 'image',
                category,
                createdAt: new Date(uploaded.created_at),
                uploadedBy: admin.id,
                uploadedByName: admin.fullName || admin.email
            }))
        );

        for (let i = 0; i < docs.length; i++) {
            logger.info('media.uploaded', {
                adminId: admin.id,
                adminName: admin.fullName || admin.email,
                publicId: docs[i].publicId,
                category: docs[i].category,
                type: docs[i].type,
                size: pickedFiles[i]?.size ?? 0
            });
        }

        const payload = docs.map((doc) => ({
            url: doc.url,
            publicId: doc.publicId,
            createdAt: doc.createdAt,
            uploadedBy: doc.uploadedByName,
            type: doc.type,
            category: doc.category
        }));

        return NextResponse.json(payload);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Upload failed';
        logger.error('media.upload.error', { message });
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const parsed = DeleteBodySchema.safeParse(body);
        if (!parsed.success) {
            const msg = parsed.error.issues.map((i) => i.message).join(', ');
            return NextResponse.json({ error: msg || 'Invalid request' }, { status: 400 });
        }

        const destroy = async (publicId: string, rt?: 'image' | 'video' | 'raw'): Promise<boolean> => {
            const tryType = async (t: 'image' | 'video' | 'raw') => {
                try {
                    const res = await cloudinary.uploader.destroy(publicId, { resource_type: t, invalidate: true });
                    const r = (res as { result?: string }).result;
                    return r === 'ok' || r === 'not found';
                } catch {
                    return false;
                }
            };
            if (rt) return await tryType(rt);
            return (await tryType('image')) || (await tryType('video')) || (await tryType('raw'));
        };

        await connectDB();

        if ('publicIds' in parsed.data) {
            const { publicIds, type } = parsed.data;
            const outcomes = await Promise.all(publicIds.map((id) => destroy(id, type)));
            await Media.deleteMany({ publicId: { $in: publicIds } });
            logger.info('media.deleted.bulk', { adminId: admin.id, count: publicIds.length });
            const ok = outcomes.every(Boolean);
            if (!ok) return NextResponse.json({ error: 'Some items failed to delete' }, { status: 500 });
            return NextResponse.json({ success: true, count: publicIds.length });
        } else {
            const { publicId, type } = parsed.data;
            const ok = await destroy(publicId, type);
            await Media.deleteOne({ publicId });
            logger.info('media.deleted', { adminId: admin.id, publicId, ok });
            if (!ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
            return NextResponse.json({ success: true, count: 1 });
        }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Delete failed';
        logger.error('media.delete.error', { message });
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
