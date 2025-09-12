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

type TxUser = { fullName: string; email: string; phone: string };

type Tx = {
    _id: string;
    user: TxUser;
    amount: number;
    type: 'initial' | 'balance';
    reference: string;
    status: 'success' | 'pending';
    createdAt: string;
};

type TxSummaryFromApi = { sumSuccess: number; pending: number };

type TxApiResp = {
    transactions: Tx[];
    summary: TxSummaryFromApi;
    total: number;
    page: number;
    pageSize: number;
};

export default function AdminDashboard() {
    const { error } = useNotifier();
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [txSummary, setTxSummary] = useState<{ totalAmount?: number; success?: number; pending?: number } | null>(null);
    const [showAmounts, setShowAmounts] = useState(false);

    useEffect(() => {
        const v = localStorage.getItem('nextgen.dash.showAmounts');
        setShowAmounts(v === '1');

        axios
            .get('/api/admin/users', { headers: { 'cache-control': 'no-cache' } })
            .then((r) => setUsers(r.data.users || []))
            .catch((e) => error(e?.response?.data?.error || e?.message || 'Failed to load students'));

        axios
            .get('/api/gallery', { params: { t: Date.now() } })
            .then((r) => setMedia(r.data || []))
            .catch((e) => error(e?.response?.data?.error || e?.message || 'Failed to load media'));

        axios
            .get<TxApiResp>('/api/admin/transaction', {
                params: { all: '1', sortKey: 'date', sortDir: 'desc' },
                headers: { 'cache-control': 'no-cache' },
            })
            .then((r) => {
                const data = r.data;
                const successCount = (data.transactions || []).filter((t) => t.status === 'success').length;
                setTxSummary({
                    totalAmount: data.summary?.sumSuccess ?? 0,
                    success: successCount,
                    pending: data.summary?.pending ?? 0,
                });
            })
            .catch(() => setTxSummary(null));
    }, [error]);

    const toggleAmounts = () => {
        setShowAmounts((prev) => {
            const next = !prev;
            localStorage.setItem('nextgen.dash.showAmounts', next ? '1' : '0');
            return next;
        });
    };

    const money = (n?: number) => {
        if (!showAmounts) return '••••';
        if (typeof n !== 'number') return '—';
        return `₦${n.toLocaleString()}`;
    };

    const studentStats = useMemo(() => {
        const fully = users.filter((u) => u.paymentStatus === 'fully_paid').length;
        const partial = users.filter((u) => u.paymentStatus === 'partially_paid').length;
        const unpaid = users.filter((u) => u.paymentStatus === 'not_paid').length;
        const total = users.length;
        return { total, fully, partial, unpaid };
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

    const StackedBar = ({ full, partial, unpaid }: { full: number; partial: number; unpaid: number }) => {
        const total = full + partial + unpaid;
        const fullW = total ? (full / total) * 100 : 0;
        const partialW = total ? (partial / total) * 100 : 0;
        const unpaidW = total ? (unpaid / total) * 100 : 0;
        return (
            <div className="w-full h-3 rounded bg-gray-100 overflow-hidden">
                <div className="h-3 bg-emerald-500 inline-block" style={{ width: `${fullW}%` }} />
                <div className="h-3 bg-amber-400 inline-block" style={{ width: `${partialW}%` }} />
                <div className="h-3 bg-red-400 inline-block" style={{ width: `${unpaidW}%` }} />
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 mb-8 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-lg mt-1">Key metrics and quick actions</p>
                </div>
                <button
                    onClick={toggleAmounts}
                    className="flex items-center gap-2 rounded-md bg-black/15 hover:bg-black/25 px-3 py-2"
                    aria-label={showAmounts ? 'Hide' : 'Show'}
                >
                    {showAmounts ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.1 12.9A12.1 12.1 0 012 12c2.2-4.6 6.3-7.5 10-7.5 2.1 0 4.2.8 6 2.3M22 22L2 2" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                            <circle cx="12" cy="12" r="3" strokeWidth={2} />
                        </svg>
                    )}
                    <span className="text-sm">{showAmounts ? 'Hide' : 'Show'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Students"
                    value={studentStats.total}
                    sub={`${studentStats.fully} fully • ${studentStats.partial} partial • ${studentStats.unpaid} unpaid`}
                />
                <StatCard label="Images" value={mediaStats.byType.images} sub="Gallery items" />
                <StatCard label="Videos" value={mediaStats.byType.videos} sub="Gallery items" />
                <StatCard
                    label="Payments (₦)"
                    value={money(txSummary?.totalAmount)}
                    sub={`${txSummary?.success ?? '—'} success • ${txSummary?.pending ?? '—'} pending`}
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
                    <div className="grid grid-cols-3 gap-4 text-center">
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
                        <div>
                            <div className="text-2xl font-semibold">{studentStats.unpaid}</div>
                            <div className="text-sm text-gray-500">Unpaid</div>
                            <div className="mt-1 text-xs text-gray-500">{pct(studentStats.unpaid, studentStats.total)}%</div>
                        </div>
                    </div>
                    <div className="mt-5 h-3 w-full rounded bg-gray-100 overflow-hidden">
                        <StackedBar full={studentStats.fully} partial={studentStats.partial} unpaid={studentStats.unpaid} />
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
                                        style={{
                                            width: `${(mediaStats.cat[cat].image / Math.max(1, mediaStats.cat[cat].image + mediaStats.cat[cat].video)) * 100}%`,
                                        }}
                                    />
                                    <div
                                        className="h-3 bg-purple-500 inline-block"
                                        style={{
                                            width: `${(mediaStats.cat[cat].video / Math.max(1, mediaStats.cat[cat].image + mediaStats.cat[cat].video)) * 100}%`,
                                        }}
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
                    <StatCard label="Total Received" value={money(txSummary?.totalAmount)} />
                    <StatCard label="Successful" value={txSummary?.success ?? '—'} />
                    <StatCard label="Pending" value={txSummary?.pending ?? '—'} />
                </div>
                {!txSummary && <div className="mt-3 text-xs text-gray-500">No transaction data loaded.</div>}
            </div>
        </div>
    );
}
