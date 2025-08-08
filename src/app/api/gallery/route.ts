import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const categories = ['electric', 'solar', 'plumbing'] as const;

export async function GET() {
    try {
        const allMedia: Array<{
            url: string;
            type: 'image' | 'video';
            category: (typeof categories)[number];
            publicId: string;
            createdAt: string;
            uploadedBy: string | null;
        }> = [];

        for (const category of categories) {
            const result = await cloudinary.search
                .expression(`folder:nextgen/${category}`)
                .sort_by('created_at', 'desc')
                .max_results(50)
                .execute();

            const resources = (result.resources as any[]).map((r) => ({
                url: r.secure_url as string,
                type: r.resource_type === 'video' ? 'video' as const : 'image' as const,
                category,
                publicId: r.public_id,
                createdAt: r.created_at,
                uploadedBy: r.context?.uploaded_by || '',
            }));

            allMedia.push(...resources);
        }

        return NextResponse.json(allMedia);
    } catch (err) {
        console.error('[GALLERY_FETCH_ERROR]', err);
        return NextResponse.json([], { status: 500 });
    }
}
