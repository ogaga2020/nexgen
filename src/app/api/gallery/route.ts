import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key: process.env.CLOUDINARY_API_KEY ?? '',
    api_secret: process.env.CLOUDINARY_API_SECRET ?? ''
});

const categories = ['electric', 'solar', 'plumbing'] as const;
type Category = (typeof categories)[number];

type CldResource = {
    public_id: string;
    resource_type: 'image' | 'video' | 'raw' | string;
    secure_url: string;
    created_at: string;
    context?: { custom?: { uploaded_by?: string } };
};
type CldSearchResult = { resources: CldResource[] };

type MediaItem = {
    url: string;
    type: 'image' | 'video';
    category: Category;
    publicId: string;
    createdAt: string;
    uploadedBy: string;
};

export async function GET() {
    try {
        const allMedia: MediaItem[] = [];

        for (const category of categories) {
            const result = (await cloudinary.search
                .expression(`folder:enterprise/${category}`)
                .sort_by('created_at', 'desc')
                .with_field('context')
                .max_results(50)
                .execute()) as unknown as CldSearchResult;

            const items: MediaItem[] = result.resources.map((r) => {
                const mediaType: 'image' | 'video' =
                    r.resource_type === 'video' ? 'video' : 'image';

                return {
                    url: r.secure_url,
                    type: mediaType,
                    category,
                    publicId: r.public_id,
                    createdAt: r.created_at,
                    uploadedBy: r.context?.custom?.uploaded_by ?? ''
                };
            });

            allMedia.push(...items);
        }

        return NextResponse.json(allMedia);
    } catch {
        return NextResponse.json([], { status: 500 });
    }
}
