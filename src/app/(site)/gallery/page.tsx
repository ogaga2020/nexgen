'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type Category = 'all' | 'electric' | 'solar' | 'plumbing';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
    category: Exclude<Category, 'all'>;
}

export default function GalleryPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Category>('all');

    const load = async () => {
        setLoading(true);
        try {
            const res = await axios.get<MediaItem[]>('/api/gallery');
            setMedia(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const handleVisibilityChange = () => {
            if (!document.hidden) load();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const tabs: Category[] = ['all', 'electric', 'solar', 'plumbing'];
    const filtered =
        activeTab === 'all' ? media : media.filter((m) => m.category === activeTab);

    return (
        <>
            <section className="bg-gradient-to-br from-blue-900 to-blue-600 text-white py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Gallery</h1>
                <p className="text-lg md:text-xl max-w-3xl mx-auto">
                    Highlights from Electrical, Solar, and Plumbing trainings.
                </p>
            </section>

            <div className="py-12 px-4 max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                    {tabs.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-4 py-2 rounded-md font-medium transition border ${activeTab === cat
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {cat === 'all'
                                ? 'All'
                                : cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 rounded-lg border animate-pulse bg-gray-100"
                            />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-gray-600">
                        No media available{activeTab !== 'all' ? ` for ${activeTab}` : ''} yet.
                    </p>
                ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filtered.map((item, i) => (
                            <div
                                key={`${item.url}-${i}`}
                                className="overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition"
                            >
                                {item.type === 'video' ? (
                                    <video
                                        src={item.url}
                                        controls
                                        className="w-full h-64 object-cover"
                                    />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt=""
                                        loading="lazy"
                                        className="w-full h-64 object-cover"
                                    />
                                )}
                                <div className="px-3 py-2 text-sm text-gray-600 border-t bg-white">
                                    {item.category.charAt(0).toUpperCase() +
                                        item.category.slice(1)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
