'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
    category: 'electric' | 'solar' | 'plumbing';
}

export default function GalleryPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'electric' | 'solar' | 'plumbing'>('electric');

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await axios.get('/api/gallery');
                console.log('Media fetched:', res.data);
                setMedia(res.data);
            } catch (err) {
                console.error('Failed to load gallery', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    const filtered = media.filter((m) => m.category === activeTab);

    return (
        <div className="py-12 px-4 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6 text-primary">Gallery</h1>

            <div className="flex justify-center mb-8 gap-4">
                {['electric', 'solar', 'plumbing'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat as any)}
                        className={`px-4 py-2 rounded ${activeTab === cat ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Loading media...</p>
            ) : filtered.length === 0 ? (
                <p className="text-center text-gray-500">No media available for this category yet.</p>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {filtered.map((item, i) => (
                        <div key={i} className="border rounded shadow p-2">
                            {item.type === 'video' ? (
                                <video src={item.url} controls className="w-full h-64 object-cover rounded" />
                            ) : (
                                <img src={item.url} alt="Media" className="w-full h-64 object-cover rounded" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
