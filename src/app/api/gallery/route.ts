import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const categories = ['electric', 'solar', 'plumbing'];

export async function GET() {
    try {
        const allMedia = [];

        for (const category of categories) {
            const result = await cloudinary.search
                .expression(`folder:nextgen/${category}`)
                .sort_by('created_at', 'desc')
                .max_results(20)
                .execute();

            const resources = result.resources.map((r: any) => ({
                url: r.secure_url,
                type: r.resource_type === 'video' ? 'video' : 'image',
                category,
            }));

            allMedia.push(...resources);
        }

        return NextResponse.json(allMedia);
    } catch (err) {
        console.error('[GALLERY_FETCH_ERROR]', err);
        return NextResponse.json([], { status: 500 });
    }
}
