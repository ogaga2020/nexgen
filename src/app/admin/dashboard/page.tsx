'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useNotifier } from '@/components/Notifier';

type User = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    trainingType: string;
    trainingDuration: number;
    paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid' | string;
};

type Category = 'plumbing' | 'electric' | 'solar';
type MediaItem = {
    url: string;
    type: 'image' | 'video';
    category: Category;
    publicId?: string;
    createdAt?: string;
};

export default function AdminDashboard() {
    const { error } = useNotifier();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [txSummary, setTxSummary] = useState<{ totalAmount?: number; success?: number; failed?: number } | null>(null);

    useEffect(() => {
        axios
            .get('/api/admin/users', { headers: { 'cache-control': 'no-cache' } })
            .then((r) => setUsers(r.data.users || []))
            .catch((e) => error(e?.response?.data?.error || e?.message || 'Failed to load students'));
        axios
            .get('/api/gallery', { params: { t: Date.now() } })
            .then((r) => setMedia(r.data || []))
            .catch((e) => error(e?.response?.data?.error || e?.message || 'Failed to load media'));
        axios
            .get('/api/admin/transactions/summary')
            .then((r) => setTxSummary(r.data || {}))
            .catch(() => setTxSummary(null));
    }, [error]);

    const studentStats = useMemo(() => {
        const fully = users.filter((u) => u.paymentStatus === 'fully_paid').length;
        const partial = users.filter((u) => u.paymentStatus === 'partially_paid').length;
        const total = fully + partial;
        return { total, fully, partial };
    }, [users]);

    const mediaStats = useMemo(() => {
        const byType = {
            images: media.filter((m) => m.type === 'image').length,
            videos: media.filter((m) => m.type === 'video').length,
        };
        const cat = { plumbing: { image: 0, video: 0 }, electric: { image: 0, video: 0 }, solar: { image: 0, video: 0 } };
        media.forEach((m) => {
            const key = m.category as Category;
            if (m.type === 'image') cat[key].image += 1;
            else cat[key].video += 1;
        });
        return { byType, cat };
    }, [media]);

    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);

    const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="mt-1 text-3xl font-semibold">{value}</div>
            {sub ? <div className="mt-1 text-xs text-gray-500">{sub}</div> : null}
        </div>
    );

    const StackedBar = ({ full, partial }: { full: number; partial: number }) => {
        const total = full + partial;
        const fullW = total ? (full / total) * 100 : 0;
        const partialW = total ? (partial / total) * 100 : 0;
        return (
            <div className="w-full h-3 rounded bg-gray-100 overflow-hidden">
                <div className="h-3 bg-emerald-500 inline-block" style={{ width: `${fullW}%` }} />
                <div className="h-3 bg-amber-400 inline-block" style={{ width: `${partialW}%` }} />
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-lg mt-1">Key metrics and quick actions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Students" value={studentStats.total} sub={`${studentStats.fully} fully • ${studentStats.partial} partial`} />
                <StatCard label="Images" value={mediaStats.byType.images} sub="Gallery items" />
                <StatCard label="Videos" value={mediaStats.byType.videos} sub="Gallery items" />
                <StatCard
                    label="Payments (₦)"
                    value={txSummary?.totalAmount ? txSummary.totalAmount.toLocaleString() : '—'}
                    sub={`${txSummary?.success ?? '—'} success • ${txSummary?.failed ?? '—'} failed`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Student Payments</h3>
                        <button onClick={() => router.push('/admin/students')} className="text-sm text-blue-600 hover:underline">
                            View students
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-semibold">{studentStats.fully}</div>
                            <div className="text-sm text-gray-500">Fully</div>
                            <div className="mt-1 text-xs text-gray-500">{pct(studentStats.fully, studentStats.total)}%</div>
                        </div>
                        <div>
                            <div className="text-2xl font-semibold">{studentStats.partial}</div>
                            <div className="text-sm text-gray-500">Partial</div>
                            <div className="mt-1 text-xs text-gray-500">{pct(studentStats.partial, studentStats.total)}%</div>
                        </div>
                    </div>
                    <div className="mt-5 h-3 w-full rounded bg-gray-100 overflow-hidden">
                        <StackedBar full={studentStats.fully} partial={studentStats.partial} />
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Media by Category</h3>
                        <button onClick={() => router.push('/admin/media')} className="text-sm text-blue-600 hover:underline">
                            Manage media
                        </button>
                    </div>
                    <div className="space-y-4">
                        {(['plumbing', 'electric', 'solar'] as Category[]).map((cat) => (
                            <div key={cat}>
                                <div className="flex items-center justify-between mb-1 text-sm">
                                    <span className="capitalize">{cat}</span>
                                    <span className="text-gray-500">
                                        {mediaStats.cat[cat].image} img • {mediaStats.cat[cat].video} vid
                                    </span>
                                </div>
                                <div className="w-full h-3 rounded bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-3 bg-blue-500 inline-block"
                                        style={{ width: `${(mediaStats.cat[cat].image / Math.max(1, mediaStats.cat[cat].image + mediaStats.cat[cat].video)) * 100}%` }}
                                    />
                                    <div
                                        className="h-3 bg-purple-500 inline-block"
                                        style={{ width: `${(mediaStats.cat[cat].video / Math.max(1, mediaStats.cat[cat].image + mediaStats.cat[cat].video)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm" /> Image
                            <span className="inline-block w-3 h-3 bg-purple-500 rounded-sm" /> Video
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Transactions</h3>
                    <button onClick={() => router.push('/admin/transaction')} className="text-sm text-blue-600 hover:underline">
                        View transactions
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard label="Total Received" value={txSummary?.totalAmount ? `₦${txSummary.totalAmount.toLocaleString()}` : '—'} />
                    <StatCard label="Successful" value={txSummary?.success ?? '—'} />
                    <StatCard label="Failed" value={txSummary?.failed ?? '—'} />
                </div>
                {!txSummary && <div className="mt-3 text-xs text-gray-500">No transaction summary API detected.</div>}
            </div>
        </div>
    );
}
