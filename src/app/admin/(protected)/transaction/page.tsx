'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNotifier } from '@/components/Notifier';

type TxUser = { fullName: string; email: string; phone: string };
type Transaction = {
    _id: string;
    userId: string;
    user: TxUser;
    amount: number;
    type: 'initial' | 'balance';
    reference: string;
    status: 'success' | 'pending';
    createdAt: string;
};
type Summary = { sumSuccess: number; pending: number; failed: number };
type TxApiResp = { transactions: Transaction[]; summary: Summary; total: number; pageSize: number };

type Audit = {
    user: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        trainingType: 'Electrical' | 'Plumbing' | 'Solar';
        trainingDuration: 4 | 8 | 12;
        paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid';
        tuition: number;
        expectedInitial: number;
        expectedBalance: number;
        paidTotal: number;
    };
    initial: null | { amount: number; expected: number; status: 'pending' | 'success'; reference: string; date: string };
    balance: null | { amount: number; expected: number; status: 'pending' | 'success'; reference: string; date: string };
};

export default function TransactionsPage() {
    const { error } = useNotifier();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({ sumSuccess: 0, pending: 0, failed: 0 });
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    const [page, setPage] = useState(1);
    const [month, setMonth] = useState<'all' | string>('all');
    const [status, setStatus] = useState<'all' | 'success' | 'pending'>('all');
    const [tType, setTType] = useState<'all' | 'initial' | 'balance'>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'date' | 'amount'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [loading, setLoading] = useState(false);

    const [auditOpen, setAuditOpen] = useState(false);
    const [auditLoading, setAuditLoading] = useState(false);
    const [audit, setAudit] = useState<Audit | null>(null);

    const months = useMemo((): { label: string; value: string }[] => {
        const list = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }));
        return [{ label: 'All Months', value: 'all' }, ...list.map((label, i) => ({ label, value: String(i + 1) }))];
    }, []);

    const fetchTx = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            if (status !== 'all') params.set('status', status);
            if (tType !== 'all') params.set('type', tType);
            params.set('sortKey', sortKey);
            params.set('sortDir', sortDir);
            if (search.trim()) params.set('search', search.trim());
            if (month !== 'all') params.set('month', month);

            const { data } = await axios.get<TxApiResp>(`/api/admin/transaction?${params.toString()}`, {
                headers: { 'cache-control': 'no-cache' },
            });

            setTransactions(data.transactions || []);
            setSummary(data.summary || { sumSuccess: 0, pending: 0, failed: 0 });
            setTotal(data.total || 0);
            setPageSize(data.pageSize || 20);
        } catch (e: unknown) {
            let msg = 'Failed to fetch transactions';
            if (axios.isAxiosError(e)) msg = (e.response?.data as { error?: string } | undefined)?.error || e.message || msg;
            else if (e instanceof Error) msg = e.message || msg;
            setTransactions([]);
            setSummary({ sumSuccess: 0, pending: 0, failed: 0 });
            setTotal(0);
            error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTx();
    }, [page, month, status, tType, search, sortKey, sortDir]);

    useEffect(() => {
        if (auditOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [auditOpen]);

    const exportToExcel = async () => {
        const params = new URLSearchParams();
        params.set('all', '1');
        if (status !== 'all') params.set('status', status);
        if (tType !== 'all') params.set('type', tType);
        params.set('sortKey', sortKey);
        params.set('sortDir', sortDir);
        if (search.trim()) params.set('search', search.trim());
        if (month !== 'all') params.set('month', month);

        const { data } = await axios.get<TxApiResp>(`/api/admin/transaction?${params.toString()}`);
        const list: Transaction[] = data.transactions || [];

        const sheetData = list.map((t) => ({
            Name: t.user.fullName,
            Email: t.user.email,
            Phone: t.user.phone,
            Amount: t.amount,
            Type: t.type,
            Reference: t.reference,
            Status: t.status,
            Date: new Date(t.createdAt).toLocaleString(),
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'transactions.xlsx');
    };

    const badge = (st: Transaction['status']) =>
        st === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800';

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const openAudit = async (userId: string) => {
        setAuditOpen(true);
        setAuditLoading(true);
        try {
            const { data } = await axios.get<Audit>(`/api/admin/transaction/audit/${userId}`);
            setAudit(data);
        } finally {
            setAuditLoading(false);
        }
    };

    return (
        <>
            <section className="bg-gradient-to-r from-green-800 to-green-500 text-white py-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold">Transactions</h1>
                    <p className="opacity-90 mt-1">View and export payment activity</p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Successful Amount</p>
                        <p className="text-2xl font-semibold mt-1">₦{summary.sumSuccess.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Pending</p>
                        <p className="text-2xl font-semibold mt-1">{summary.pending}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Total Records</p>
                        <p className="text-2xl font-semibold mt-1">{total}</p>
                    </div>
                </div>

                <div className="bg-white border rounded-xl shadow-sm p-4 mb-6 grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-3 items-end">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Name, email, or reference…"
                            className="input-field bg-white w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select
                            value={month}
                            onChange={(e) => {
                                setMonth(e.target.value);
                                setPage(1);
                            }}
                            className="input-field bg-white w-full"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as 'all' | 'success' | 'pending');
                                setPage(1);
                            }}
                            className="input-field bg-white w-full"
                        >
                            <option value="all">All</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={tType}
                            onChange={(e) => {
                                setTType(e.target.value as 'all' | 'initial' | 'balance');
                                setPage(1);
                            }}
                            className="input-field bg-white w-full"
                        >
                            <option value="all">All</option>
                            <option value="initial">Initial</option>
                            <option value="balance">Balance</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                        <div className="flex gap-2">
                            <select
                                value={sortKey}
                                onChange={(e) => {
                                    setSortKey(e.target.value as 'date' | 'amount');
                                    setPage(1);
                                }}
                                className="input-field bg-white"
                            >
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                            </select>
                            <select
                                value={sortDir}
                                onChange={(e) => {
                                    setSortDir(e.target.value as 'asc' | 'desc');
                                    setPage(1);
                                }}
                                className="input-field bg-white"
                            >
                                <option value="desc">Desc</option>
                                <option value="asc">Asc</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full sm:col-start-2 md:col-start-3 lg:col-start-5 sm:flex sm:justify-end">
                        <button
                            onClick={exportToExcel}
                            className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-md"
                        >
                            Export to Excel
                        </button>
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Reference</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((t) => (
                                <tr key={t._id} className="border-t">
                                    <td className="px-4 py-2 text-left">{t.user.fullName}</td>
                                    <td className="px-4 py-2">{t.user.email}</td>
                                    <td className="px-4 py-2">₦{t.amount.toLocaleString()}</td>
                                    <td className="px-4 py-2 capitalize">{t.type}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${badge(t.status)}`}>{t.status}</span>
                                    </td>
                                    <td className="px-4 py-2">{t.reference}</td>
                                    <td className="px-4 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => openAudit(t.userId)}
                                            className="px-3 py-1 rounded bg-gray-800 text-white hover:opacity-90"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                                        {loading ? 'Loading…' : 'No transactions found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden space-y-2">
                    {transactions.map((t) => (
                        <div key={t._id} className="rounded-xl border bg-white p-3 flex items-center justify-between">
                            <div className="min-w-0">
                                <p className="font-medium truncate">{t.user.fullName}</p>
                                <p className="text-xs text-gray-500 truncate">{t.user.email}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs">
                                    <span className="font-semibold">₦{t.amount.toLocaleString()}</span>
                                    <span className="capitalize text-gray-600">{t.type}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge(t.status)}`}>{t.status}</span>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Ref: {t.reference}</p>
                                <p className="text-[11px] text-gray-400">{new Date(t.createdAt).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => openAudit(t.userId)}
                                className="ml-3 shrink-0 rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm text-white"
                            >
                                View
                            </button>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <p className="text-center text-gray-500 py-10">{loading ? 'Loading…' : 'No transactions found.'}</p>
                    )}
                </div>

                {Math.max(1, Math.ceil(total / pageSize)) > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 rounded ${p === page ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                                disabled={loading}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {auditOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-lg font-semibold">Payment Audit</h3>
                                <button onClick={() => setAuditOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <div className="px-4 pb-4">
                                <div className="max-h-[70vh] overflow-y-auto pr-1">
                                    {auditLoading && <p>Loading…</p>}
                                    {!auditLoading && audit && (
                                        <div className="space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                                <div><span className="text-gray-500">Name:</span> {audit.user.fullName}</div>
                                                <div><span className="text-gray-500">Email:</span> {audit.user.email}</div>
                                                <div><span className="text-gray-500">Program:</span> {audit.user.trainingType} ({audit.user.trainingDuration} months)</div>
                                                <div><span className="text-gray-500">Payment Status:</span> {audit.user.paymentStatus.replace('_', ' ')}</div>
                                                <div><span className="text-gray-500">Tuition:</span> ₦{audit.user.tuition.toLocaleString()}</div>
                                                <div><span className="text-gray-500">Paid Total:</span> ₦{audit.user.paidTotal.toLocaleString()}</div>
                                            </div>

                                            <div className="border rounded-lg">
                                                <div className="p-3 border-b font-medium bg-gray-50">Initial (60%)</div>
                                                <div className="p-3 text-sm grid sm:grid-cols-2 gap-2">
                                                    <div><span className="text-gray-500">Expected:</span> ₦{(audit.initial?.expected ?? 0).toLocaleString()}</div>
                                                    <div><span className="text-gray-500">Amount:</span> {audit.initial ? `₦${audit.initial.amount.toLocaleString()}` : '-'}</div>
                                                    <div><span className="text-gray-500">Status:</span> {audit.initial?.status ?? '-'}</div>
                                                    <div><span className="text-gray-500">Reference:</span> {audit.initial?.reference ?? '-'}</div>
                                                    <div className="sm:col-span-2"><span className="text-gray-500">Date:</span> {audit.initial?.date ? new Date(audit.initial.date).toLocaleString() : '-'}</div>
                                                </div>
                                            </div>

                                            <div className="border rounded-lg">
                                                <div className="p-3 border-b font-medium bg-gray-50">Balance (40%)</div>
                                                <div className="p-3 text-sm grid sm:grid-cols-2 gap-2">
                                                    <div><span className="text-gray-500">Expected:</span> ₦{(audit.balance?.expected ?? (audit.user.tuition - (audit.initial?.expected ?? 0))).toLocaleString()}</div>
                                                    <div><span className="text-gray-500">Amount:</span> {audit.balance ? `₦${audit.balance.amount.toLocaleString()}` : '-'}</div>
                                                    <div><span className="text-gray-500">Status:</span> {audit.balance?.status ?? '-'}</div>
                                                    <div><span className="text-gray-500">Reference:</span> {audit.balance?.reference ?? '-'}</div>
                                                    <div className="sm:col-span-2"><span className="text-gray-500">Date:</span> {audit.balance?.date ? new Date(audit.balance.date).toLocaleString() : '-'}</div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <strong>Snapshot:</strong>{' '}
                                                {audit.initial?.status !== 'success'
                                                    ? 'Initial payment pending (60%)'
                                                    : audit.balance?.status !== 'success'
                                                        ? 'Balance pending (40%)'
                                                        : 'Fully paid (100%)'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t flex justify-end">
                                <button onClick={() => setAuditOpen(false)} className="px-4 py-2 rounded bg-gray-800 text-white">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
