import { connectDB } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import { promisify } from 'util';

export const config = {
    api: {
        bodyParser: false,
    },
};

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const parseForm = promisify((req: any, cb: any) =>
    new IncomingForm({ multiples: false }).parse(req, cb)
);

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const [fields, files] = await parseForm(req) as [any, any];
        const file = files.file?.[0];
        const category = fields.category?.[0];

        if (!file || !category) {
            return NextResponse.json({ error: 'Missing file or category' }, { status: 400 });
        }

        const cloudinaryPath = `nextgen/${category.toLowerCase()}`;
        const result = await cloudinary.uploader.upload(file.filepath, {
            folder: cloudinaryPath,
            use_filename: true,
        });

        return NextResponse.json({ url: result.secure_url });
    } catch (err) {
        console.error('[MEDIA_UPLOAD_ERROR]', err);
        return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
    }
}
