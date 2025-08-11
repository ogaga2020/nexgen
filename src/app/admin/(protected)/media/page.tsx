'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNotifier } from '@/components/Notifier';

type Category = 'plumbing' | 'electric' | 'solar';

type MediaItem = {
    url: string;
    type: 'image' | 'video';
    category: Category;
    publicId?: string;
    createdAt?: string;
    uploadedBy?: string;
};

const MAX_MB = 20;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function MediaUploadPage() {
    const { success, error } = useNotifier();

    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState<Category>('plumbing');
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);

    const [media, setMedia] = useState<MediaItem[]>([]);
    const [search, setSearch] = useState('');
    const [active, setActive] = useState<'all' | Category>('all');
    const [viewing, setViewing] = useState<MediaItem | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const load = async () => {
        const res = await axios.get<MediaItem[]>('/api/gallery', { params: { t: Date.now() } });
        setMedia(res.data || []);
    };

    useEffect(() => {
        load();
    }, []);

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] || null;
        if (f && f.size > MAX_BYTES) {
            error(`File is too large. Max ${MAX_MB}MB.`);
            if (inputRef.current) inputRef.current.value = '';
            setFile(null);
            setPreview('');
            return;
        }
        setFile(f);
        setPreview(f ? URL.createObjectURL(f) : '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        if (file.size > MAX_BYTES) {
            error(`File is too large. Max ${MAX_MB}MB.`);
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        try {
            setUploading(true);
            const { data } = await axios.post<MediaItem>('/api/admin/media', formData);
            success('Upload successful');
            setMedia((prev) => [data, ...prev]);
            setTimeout(() => load(), 300);
            setFile(null);
            setPreview('');
            if (inputRef.current) inputRef.current.value = '';
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Upload failed';
            error(String(msg));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item: MediaItem) => {
        const ok = confirm('Delete this media?');
        if (!ok) return;
        try {
            await axios.delete('/api/admin/media', { data: { publicId: item.publicId, type: item.type } });
            setMedia((m) => m.filter((x) => x.publicId !== item.publicId));
            success('Media deleted');
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Delete failed';
            error(String(msg));
        }
    };

    const filtered = useMemo(() => {
        let out = media.slice();
        if (active !== 'all') out = out.filter((m) => m.category === active);
        if (search.trim()) {
            const s = search.trim().toLowerCase();
            out = out.filter(
                (m) =>
                    m.url.toLowerCase().includes(s) ||
                    (m.uploadedBy || '').toLowerCase().includes(s) ||
                    m.category.includes(s as Category)
            );
        }
        out.sort((a, b) => {
            const da = a.createdAt ? +new Date(a.createdAt) : 0;
            const db = b.createdAt ? +new Date(b.createdAt) : 0;
            return db - da;
        });
        return out;
    }, [media, active, search]);

    const pill = (key: 'all' | Category, label: string) => (
        <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-3 py-1 rounded-md border transition ${active === key
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <div className="max-w-7xl mx-auto py-10 px-4">
                <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 mb-8">
                    <h1 className="text-3xl font-bold">Media</h1>
                    <p className="text-lg mt-1">Upload and manage gallery assets</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid md:grid-cols-3 gap-4 bg-white p-4 border rounded-lg shadow-sm mb-8"
                >
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className="input-field w-full bg-white"
                        >
                            <option value="plumbing">Plumbing</option>
                            <option value="electric">Electric</option>
                            <option value="solar">Solar</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1 font-medium text-gray-700">File</label>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={onFile}
                            className="input-field w-full bg-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max size: {MAX_MB}MB</p>
                    </div>

                    {preview && (
                        <div className="md:col-span-3">
                            {file?.type?.startsWith('video') ? (
                                <video src={preview} controls className="w-full rounded-md border max-h-[60vh] object-contain" />
                            ) : (
                                <img src={preview} alt="Preview" className="w-full rounded-md border max-h-[60vh] object-contain" />
                            )}
                        </div>
                    )}

                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="bg-[var(--primary)] text-white px-6 py-2 rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-60"
                        >
                            {uploading ? 'Uploading…' : 'Upload'}
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search (url, uploader, category)…"
                        className="input-field bg-white w-full md:w-80"
                    />
                    {pill('all', 'All')}
                    {pill('electric', 'Electric')}
                    {pill('solar', 'Solar')}
                    {pill('plumbing', 'Plumbing')}
                </div>

                <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Media</th>
                                <th className="px-4 py-3 md:table-cell">Type</th>
                                <th className="px-4 py-3 hidden md:table-cell">Category</th>
                                <th className="px-4 py-3 hidden md:table-cell">Date</th>
                                <th className="px-4 py-3 text-right md:text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((m) => (
                                <tr key={m.publicId || m.url} className="border-t">
                                    <td className="px-4 py-2 text-left">
                                        <button
                                            onClick={() => setViewing(m)}
                                            className="inline-flex items-center gap-3 hover:underline"
                                            title="View"
                                        >
                                            {m.type === 'image' ? (
                                                <img src={m.url} alt="" className="w-12 h-12 md:w-10 md:h-10 object-cover rounded border" />
                                            ) : (
                                                <div className="w-12 h-12 md:w-10 md:h-10 rounded border grid place-items-center">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-600">
                                                        <path fill="currentColor" d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <span className="hidden md:inline max-w-[28ch] truncate">{m.url}</span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 capitalize md:table-cell">{m.type}</td>
                                    <td className="px-4 py-2 capitalize hidden md:table-cell">{m.category}</td>
                                    <td className="px-4 py-2 hidden md:table-cell">
                                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}
                                    </td>
                                    <td className="px-4 py-2 text-right md:text-left space-x-3">
                                        <button onClick={() => setViewing(m)} className="text-blue-600 hover:underline">View</button>
                                        <button onClick={() => handleDelete(m)} className="text-red-600 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                                        No media found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {viewing && (
                    <div
                        className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-0 md:p-4"
                        onClick={() => setViewing(null)}
                    >
                        <div
                            className="relative bg-white w-full md:max-w-5xl md:rounded-xl shadow-2xl h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-5 py-4 border-b sticky top-0 bg-white z-10">
                                <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
                            </div>

                            <div className="p-4">
                                <div className="w-full grid place-items-center">
                                    {viewing?.type === 'image' ? (
                                        <img
                                            src={viewing.url}
                                            alt=""
                                            className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                        />
                                    ) : (
                                        <video
                                            src={viewing.url}
                                            controls
                                            className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                                        />
                                    )}
                                </div>

                                <div className="mt-4 text-sm text-gray-700 space-y-1 md:grid md:grid-cols-2 md:gap-4">
                                    <div><b>Type:</b> {viewing?.type}</div>
                                    <div><b>Category:</b> {viewing?.category}</div>
                                    <div><b>Uploaded:</b> {viewing?.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}</div>
                                    <div><b>By:</b> {viewing?.uploadedBy || '—'}</div>
                                    <a href={viewing?.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                        Open in new tab
                                    </a>
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <button
                                        onClick={() => setViewing(null)}
                                        className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
