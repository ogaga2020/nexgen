import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const file = form.get('file') as File | null;
        const categoryRaw = (form.get('category') as string | null) || 'plumbing';
        const uploadedBy = (form.get('uploadedBy') as string | null) || 'Admin';

        const category = ['electric', 'solar', 'plumbing'].includes(categoryRaw.toLowerCase())
            ? (categoryRaw.toLowerCase() as 'electric' | 'solar' | 'plumbing')
            : 'plumbing';

        if (!file) {
            return NextResponse.json({ error: 'No file' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploaded = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `nextgen/${category}`,
                    resource_type: 'auto',
                    use_filename: true,
                    context: { uploaded_by: uploadedBy },
                },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve(result);
                }
            );
            stream.end(buffer);
        });

        return NextResponse.json({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            createdAt: uploaded.created_at,
            uploadedBy,
        });
    } catch (err) {
        console.error('[MEDIA_UPLOAD_ERROR]', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { publicId } = await req.json();

        if (!publicId) {
            return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
        }

        await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[MEDIA_DELETE_ERROR]', err);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
