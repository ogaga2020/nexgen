'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

    const [files, setFiles] = useState<File[]>([]);
    const [category, setCategory] = useState<Category>('plumbing');
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const [media, setMedia] = useState<MediaItem[]>([]);
    const [active, setActive] = useState<'all' | Category>('all');
    const [viewing, setViewing] = useState<MediaItem | null>(null);
    const [listLoading, setListLoading] = useState(false);

    const [selected, setSelected] = useState<Set<string>>(new Set());

    const inputRef = useRef<HTMLInputElement | null>(null);

    const load = useCallback(async () => {
        try {
            setListLoading(true);
            const res = await axios.get<MediaItem[]>('/api/gallery', { params: { t: Date.now() } });
            setMedia(res.data || []);
            setSelected(new Set());
        } catch (e: any) {
            error(e?.response?.data?.error || e?.message || 'Failed to load media');
        } finally {
            setListLoading(false);
        }
    }, [error]);

    useEffect(() => {
        load();
    }, [load]);

    const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []);
        if (!picked.length) {
            setFiles([]);
            setPreviews([]);
            return;
        }
        for (const f of picked) {
            if (f.size > MAX_BYTES) {
                error(`Each file must be ≤ ${MAX_MB}MB`);
                if (inputRef.current) inputRef.current.value = '';
                setFiles([]);
                setPreviews([]);
                return;
            }
        }
        setFiles(picked);
        setPreviews(picked.map((f) => URL.createObjectURL(f)));
    };

    const clearFiles = () => {
        setFiles([]);
        setPreviews([]);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.length) return;
        for (const f of files) {
            if (f.size > MAX_BYTES) {
                error(`Each file must be ≤ ${MAX_MB}MB`);
                return;
            }
        }
        const formData = new FormData();
        for (const f of files) formData.append('files', f);
        formData.append('category', category);
        try {
            setUploading(true);
            const { data } = await axios.post<MediaItem[] | MediaItem>('/api/admin/media', formData);
            const items = Array.isArray(data) ? data : [data];
            success(`Uploaded ${items.length}`);
            setMedia((prev) => [...items, ...prev]);
            clearFiles();
            await load();
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Upload failed';
            error(String(msg));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteOne = async (item: MediaItem) => {
        const ok = confirm('Delete this media?');
        if (!ok) return;
        try {
            await axios.delete('/api/admin/media', { data: { publicId: item.publicId, type: item.type } });
            setMedia((m) => m.filter((x) => x.publicId !== item.publicId));
            setSelected((s) => {
                const n = new Set(s);
                if (item.publicId) n.delete(item.publicId);
                return n;
            });
            success('Media deleted');
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Delete failed';
            error(String(msg));
        }
    };

    const handleDeleteSelected = async () => {
        const ids = Array.from(selected).filter(Boolean);
        if (!ids.length) return;
        const ok = confirm(`Delete ${ids.length} selected item(s)?`);
        if (!ok) return;
        try {
            await axios.delete('/api/admin/media', { data: { publicIds: ids } });
            setMedia((m) => m.filter((x) => !x.publicId || !ids.includes(x.publicId)));
            setSelected(new Set());
            success(`Deleted ${ids.length}`);
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Delete failed';
            error(String(msg));
        }
    };

    const filtered = useMemo(() => {
        let out = media.slice();
        if (active !== 'all') out = out.filter((m) => m.category === active);
        out.sort((a, b) => {
            const da = a.createdAt ? +new Date(a.createdAt) : 0;
            const db = b.createdAt ? +new Date(b.createdAt) : 0;
            return db - da;
        });
        return out;
    }, [media, active]);

    const allIds = useMemo(() => {
        return filtered.map((m) => m.publicId).filter(Boolean) as string[];
    }, [filtered]);

    const computedSelectAll = useMemo(() => {
        return allIds.length > 0 && allIds.every((id) => selected.has(id));
    }, [allIds, selected]);

    const toggleSelectAll = () => {
        if (!allIds.length) return;
        if (computedSelectAll) {
            const n = new Set(selected);
            for (const id of allIds) n.delete(id);
            setSelected(n);
        } else {
            const n = new Set(selected);
            for (const id of allIds) n.add(id);
            setSelected(n);
        }
    };

    const toggleOne = (id?: string) => {
        if (!id) return;
        setSelected((s) => {
            const n = new Set(s);
            if (n.has(id)) n.delete(id);
            else n.add(id);
            return n;
        });
    };

    const pill = (key: 'all' | Category, label: string) => (
        <button
            key={key}
            onClick={() => {
                setActive(key);
                setSelected(new Set());
            }}
            className={`px-3 py-1.5 rounded-full border text-sm transition ${active === key ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <div className="max-w-7xl mx-auto py-10 px-4">
                <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 md:p-8 mb-8 shadow">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Media Library</h1>
                    <p className="text-base md:text-lg mt-1 opacity-90">Upload and manage gallery assets</p>
                </div>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 bg-white p-5 md:p-6 border rounded-2xl shadow-sm mb-8">
                    <div>
                        <label className="block mb-1 font-medium text-gray-800">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="input-field w-full bg-white">
                            <option value="plumbing">Plumbing</option>
                            <option value="electric">Electric</option>
                            <option value="solar">Solar</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block mb-1 font-medium text-gray-800">Files</label>
                        <div className="flex items-center gap-3">
                            <input ref={inputRef} type="file" accept="image/*,video/*" multiple onChange={onFiles} className="input-field w-full bg-white" />
                            {files.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearFiles}
                                    className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700"
                                    title="Clear selected files"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Max size per file: {MAX_MB}MB</p>
                    </div>

                    {previews.length > 0 && (
                        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {previews.map((src, i) => {
                                const f = files[i];
                                const isVideo = f?.type?.startsWith('video');
                                return isVideo ? (
                                    <video key={i} src={src} className="w-full rounded-xl border max-h-48 object-cover" controls />
                                ) : (
                                    <img key={i} src={src} alt="" className="w-full rounded-xl border max-h-48 object-cover" />
                                );
                            })}
                        </div>
                    )}

                    <div className="md:col-span-3 flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading || files.length === 0}
                            className="inline-flex items-center gap-2 bg-[var(--primary)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-60"
                        >
                            {uploading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 0 1 8-8v4l3.5-3.5L12 1v4a7 7 0 1 0 7 7h4c0 6.075-4.925 11-11 11S1 18.075 1 12h3z"
                                        />
                                    </svg>
                                    Uploading…
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                                        <path fill="currentColor" d="M5 20h14v-2H5v2Zm7-18L5.33 9h3.84v4h6.66V9h3.84L12 2Z" />
                                    </svg>
                                    Upload {files.length ? `(${files.length})` : ''}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {pill('all', 'All')}
                    {pill('electric', 'Electric')}
                    {pill('solar', 'Solar')}
                    {pill('plumbing', 'Plumbing')}
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={load}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm"
                            title="Refresh media list"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4">
                                <path fill="currentColor" d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 0 1-9.9 1H5.02A7 7 0 0 0 19 13c0-3.87-3.13-7-7-7Z" />
                            </svg>
                            {listLoading ? 'Refreshing…' : 'Refresh'}
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={selected.size === 0}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-300 bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-60"
                            title="Delete selected"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4">
                                <path fill="currentColor" d="M6 7h12l-1 14H7L6 7Zm3-4h6l1 3H8l1-3Z" />
                            </svg>
                            Delete ({selected.size})
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white border rounded-2xl shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={computedSelectAll}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 accent-[var(--primary)]"
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left">Media</th>
                                <th className="px-4 py-3 md:table-cell">Type</th>
                                <th className="px-4 py-3 hidden md:table-cell">Category</th>
                                <th className="px-4 py-3 hidden md:table-cell">Date</th>
                                <th className="px-4 py-3 text-right md:text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listLoading && media.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Loading media…</td>
                                </tr>
                            )}
                            {!listLoading &&
                                filtered.map((m) => {
                                    const id = m.publicId || '';
                                    const isChecked = id ? selected.has(id) : false;
                                    return (
                                        <tr key={m.publicId || m.url} className="border-t hover:bg-gray-50/50">
                                            <td className="px-4 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleOne(id)}
                                                    disabled={!id}
                                                    className="h-4 w-4 accent-[var(--primary)]"
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-left">
                                                <button onClick={() => setViewing(m)} className="inline-flex items-center gap-3 hover:underline" title="View">
                                                    {m.type === 'image' ? (
                                                        <img src={m.url} alt="" className="w-12 h-12 md:w-10 md:h-10 object-cover rounded border" />
                                                    ) : (
                                                        <div className="w-12 h-12 md:w-10 md:h-10 rounded border grid place-items-center bg-gray-100">
                                                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-700">
                                                                <path fill="currentColor" d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <span className="hidden md:inline max-w-[32ch] truncate">{m.url}</span>
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 capitalize md:table-cell">
                                                <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 border text-gray-800">{m.type}</span>
                                            </td>
                                            <td className="px-4 py-2 capitalize hidden md:table-cell">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full border ${m.category === 'electric'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : m.category === 'solar'
                                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}
                                                >
                                                    {m.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 hidden md:table-cell">
                                                {m.createdAt ? new Date(m.createdAt).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-2 text-right md:text-left space-x-3">
                                                <button onClick={() => setViewing(m)} className="text-blue-600 hover:underline">View</button>
                                                <button onClick={() => handleDeleteOne(m)} className="text-red-600 hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            {!listLoading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No media found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {viewing && (
                    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setViewing(null)}>
                        <div
                            className="relative bg-white w-full md:max-w-5xl md:rounded-2xl shadow-2xl h-[90vh] md:h-auto md:max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-5 py-4 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800">Preview</h3>
                                <button onClick={() => setViewing(null)} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm">
                                    Close
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="w-full grid place-items-center">
                                    {viewing?.type === 'image' ? (
                                        <img src={viewing.url} alt="" className="w-full h-auto max-h-[60vh] object-contain rounded-lg border" />
                                    ) : (
                                        <video src={viewing.url} controls className="w-full h-auto max-h-[60vh] object-contain rounded-lg border" />
                                    )}
                                </div>

                                <div className="mt-4 text-sm text-gray-700 grid md:grid-cols-2 gap-4">
                                    <div><b>Type:</b> {viewing?.type}</div>
                                    <div><b>Category:</b> {viewing?.category}</div>
                                    <div><b>Uploaded:</b> {viewing?.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}</div>
                                    <a href={viewing?.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open in new tab</a>
                                </div>

                                <div className="mt-5 flex justify-end gap-3">
                                    <button onClick={() => setViewing(null)} className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Close</button>
                                    <button onClick={() => handleDeleteOne(viewing)} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
