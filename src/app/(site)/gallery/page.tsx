'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

type Category = 'all' | 'electric' | 'solar' | 'plumbing';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
    category: Exclude<Category, 'all'>;
    createdAt?: string;
}

export default function GalleryPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Category>('all');
    const [viewer, setViewer] = useState<MediaItem | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await axios.get<MediaItem[]>('/api/gallery', { params: { t: Date.now() } });
            setMedia(res.data || []);
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
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const tabs: Category[] = ['all', 'electric', 'solar', 'plumbing'];

    const sorted = useMemo(() => {
        const copy = [...media];
        copy.sort((a, b) => {
            const da = a.createdAt ? +new Date(a.createdAt) : 0;
            const db = b.createdAt ? +new Date(b.createdAt) : 0;
            if (db !== da) return db - da;
            return b.url.localeCompare(a.url);
        });
        return copy;
    }, [media]);

    const filtered = useMemo(
        () => (activeTab === 'all' ? sorted : sorted.filter((m) => m.category === activeTab)),
        [sorted, activeTab]
    );

    return (
        <>
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600" />
                <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-24 text-center text-white">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/15">
                        Explore our practical training highlights
                    </div>
                    <h1 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight">Gallery</h1>
                    <p className="mt-4 md:mt-6 text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                        Electrical, Solar, and Plumbing, curated moments from the workshop.
                    </p>
                </div>
                <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
            </section>

            <div className="py-12 px-4 max-w-7xl mx-auto">
                <div className="w-full overflow-x-auto">
                    <div className="mx-auto flex w-full min-w-[22rem] max-w-3xl items-center justify-between rounded-2xl bg-blue p-2 ring-1 ring-black/10 shadow-sm">
                        {tabs.map((cat) => {
                            const active = activeTab === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={[
                                        'relative flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition',
                                        active ? 'text-white' : 'text-gray-700 hover:text-gray-900',
                                    ].join(' ')}
                                >
                                    <span className="capitalize">{cat === 'all' ? 'All' : cat}</span>
                                    <span
                                        className={[
                                            'absolute inset-0 -z-10 rounded-xl transition',
                                            active ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm' : 'bg-transparent',
                                        ].join(' ')}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="aspect-[4/3] rounded-2xl bg-gray-100 animate-pulse ring-1 ring-black/5" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mt-12 grid place-items-center">
                        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-12 text-center shadow-sm">
                            <p className="text-gray-600">
                                No media available{activeTab !== 'all' ? ` for ${activeTab}` : ''} yet.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {filtered.map((item, i) => (
                            <button
                                key={`${item.url}-${i}`}
                                onClick={() => setViewer(item)}
                                className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 shadow-sm hover:shadow-md transition"
                            >
                                {item.type === 'video' ? (
                                    <video src={item.url} className="h-full w-full object-cover aspect-[4/3]" muted />
                                ) : (
                                    <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover aspect-[4/3]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 capitalize ring-1 ring-black/10">
                                        {item.category}
                                    </span>
                                    {item.type === 'video' && (
                                        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-gray-900 ring-1 ring-black/10">
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {viewer && (
                <div className="fixed inset-0 z-[100]">
                    <div className="absolute inset-0 bg-black/70" onClick={() => setViewer(null)} />
                    <div
                        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
                        onKeyDown={(e) => e.key === 'Escape' && setViewer(null)}
                        tabIndex={-1}
                    >
                        <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 pointer-events-auto">
                            <button
                                type="button"
                                onClick={() => setViewer(null)}
                                className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                                aria-label="Close"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>

                            <div className="p-3 md:p-4">
                                <div className="w-full grid place-items-center">
                                    {viewer.type === 'image' ? (
                                        <img src={viewer.url} alt="" className="max-h-[70vh] w-full object-contain rounded-xl" />
                                    ) : (
                                        <video
                                            src={viewer.url}
                                            controls
                                            className="max-h-[70vh] w-full object-contain rounded-xl"
                                            controlsList="nodownload"
                                        />
                                    )}
                                </div>

                                <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                                    <span className="capitalize">Category: {viewer.category}</span>
                                    <a href={viewer.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                                        Open in new tab
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
