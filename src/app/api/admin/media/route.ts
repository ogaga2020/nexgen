import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Media from '@/models/Media';
import logger from '@/lib/logger';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = 'nodejs';

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

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
        const file = form.get('file') as File | null;
        const categoryRaw = (form.get('category') as string | null) || 'plumbing';
        const category = ['electric', 'solar', 'plumbing'].includes(categoryRaw.toLowerCase())
            ? (categoryRaw.toLowerCase() as 'electric' | 'solar' | 'plumbing')
            : 'plumbing';
        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
        if (file.size > MAX_BYTES) return NextResponse.json({ error: `File too large. Max ${MAX_MB}MB.` }, { status: 413 });

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploaded = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `nextgen/${category}`,
                    resource_type: 'auto',
                    use_filename: true,
                },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve(result);
                }
            );
            stream.end(buffer);
        });

        await connectDB();
        const doc = await Media.create({
            publicId: uploaded.public_id,
            url: uploaded.secure_url,
            type: uploaded.resource_type === 'video' ? 'video' : 'image',
            category,
            createdAt: new Date(uploaded.created_at),
            uploadedBy: admin.id,
            uploadedByName: admin.fullName || admin.email,
        });

        logger.info('media.uploaded', {
            adminId: admin.id,
            adminName: admin.fullName || admin.email,
            publicId: doc.publicId,
            category: doc.category,
            type: doc.type,
            size: file.size,
        });

        return NextResponse.json({
            url: doc.url,
            publicId: doc.publicId,
            createdAt: doc.createdAt,
            uploadedBy: doc.uploadedByName,
            type: doc.type,
            category: doc.category,
        });
    } catch (e) {
        logger.error('media.upload.error', { message: (e as any)?.message });
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const admin = await getCurrentAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { publicId, type } = await req.json();
        if (!publicId) return NextResponse.json({ error: 'publicId is required' }, { status: 400 });

        const destroy = async (rt: 'image' | 'video' | 'raw') => {
            try {
                const res: any = await cloudinary.uploader.destroy(publicId, { resource_type: rt, invalidate: true });
                return res?.result === 'ok' || res?.result === 'not found';
            } catch {
                return false;
            }
        };

        let ok = false;
        if (type === 'image' || type === 'video' || type === 'raw') {
            ok = await destroy(type);
        } else {
            ok = (await destroy('image')) || (await destroy('video')) || (await destroy('raw'));
        }

        await connectDB();
        await Media.deleteOne({ publicId });

        logger.info('media.deleted', { adminId: admin.id, publicId, ok });

        if (!ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (e) {
        logger.error('media.delete.error', { message: (e as any)?.message });
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
