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
        const category = ['electric', 'solar', 'plumbing'].includes(categoryRaw.toLowerCase())
            ? (categoryRaw.toLowerCase() as 'electric' | 'solar' | 'plumbing')
            : 'plumbing';

        if (!file) {
            return NextResponse.json({ error: 'No file' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const url: string = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: `nextgen/${category}`,
                    resource_type: 'auto',
                    use_filename: true,
                },
                (error, result) => {
                    if (error || !result) return reject(error);
                    resolve(result.secure_url);
                }
            );
            stream.end(buffer);
        });

        return NextResponse.json({ url });
    } catch (err) {
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
