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
            uploadedBy: string;
        }> = [];

        for (const category of categories) {
            const result: any = await cloudinary.search
                .expression(`folder:nextgen/${category}`)
                .sort_by('created_at', 'desc')
                .with_field('context')
                .max_results(50)
                .execute();

            const resources = (result.resources as any[]).map((r) => ({
                url: r.secure_url as string,
                type: (r.resource_type === 'video' ? 'video' : 'image') as 'image' | 'video',
                category,
                publicId: r.public_id as string,
                createdAt: r.created_at as string,
                uploadedBy: r?.context?.custom?.uploaded_by || '',
            }));

            allMedia.push(...resources);
        }

        return NextResponse.json(allMedia);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
