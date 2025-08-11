'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminNavbar from '@/components/AdminNavbar';
import { useNotifier } from '@/components/Notifier';

type TxUser = {
    fullName: string;
    email: string;
    phone: string;
};

type Transaction = {
    _id: string;
    user: TxUser;
    amount: number;
    type: 'initial' | 'balance';
    reference: string;
    status: 'success' | 'failed' | 'pending';
    createdAt: string;
};

type Summary = { sumSuccess: number; pending: number; failed: number };

export default function TransactionsPage() {
    const { error } = useNotifier();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<Summary>({ sumSuccess: 0, pending: 0, failed: 0 });
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    const [page, setPage] = useState(1);
    const [month, setMonth] = useState<'all' | string>('all');
    const [status, setStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
    const [tType, setTType] = useState<'all' | 'initial' | 'balance'>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'date' | 'amount'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const months = useMemo((): { label: string; value: string }[] => {
        const list = Array.from({ length: 12 }, (_, i) =>
            new Date(0, i).toLocaleString('default', { month: 'long' })
        );
        return [
            {
                label: 'All Months', value: 'all'
            }, ...list.map((label, i) => ({
                label, value: String(i + 1)
            }))
        ];
    }, []);

    const fetchTx = () => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('status', status);
        params.set('type', tType);
        params.set('sortKey', sortKey);
        params.set('sortDir', sortDir);
        if (search.trim()) params.set('search', search.trim());
        if (month !== 'all') params.set('month', month);
        axios
            .get(`/api/admin/transaction?${params.toString()}`, { headers: { 'cache-control': 'no-cache' } })
            .then((res) => {
                setTransactions(res.data.transactions || []);
                setSummary(res.data.summary || { sumSuccess: 0, pending: 0, failed: 0 });
                setTotal(res.data.total || 0);
                setPageSize(res.data.pageSize || 20);
            })
            .catch((e) => {
                setTransactions([]);
                setSummary({ sumSuccess: 0, pending: 0, failed: 0 });
                setTotal(0);
                error(e?.response?.data?.error || e?.message || 'Failed to fetch transactions');
            });
    };

    useEffect(() => {
        fetchTx();
    }, [page, month, status, tType, search, sortKey, sortDir]);

    const exportToExcel = async () => {
        const params = new URLSearchParams();
        params.set('all', '1');
        params.set('status', status);
        params.set('type', tType);
        params.set('sortKey', sortKey);
        params.set('sortDir', sortDir);
        if (search.trim()) params.set('search', search.trim());
        if (month !== 'all') params.set('month', month);
        const res = await axios.get(`/api/admin/transaction?${params.toString()}`);
        const list: Transaction[] = res.data.transactions || [];
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
        st === 'success'
            ? 'bg-[var(--success)] text-white'
            : st === 'pending'
                ? 'bg-[var(--warning)] text-black'
                : 'bg-[var(--danger)] text-white';

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <>
            <AdminNavbar />

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
                        <p className="text-gray-500 text-sm">Failed</p>
                        <p className="text-2xl font-semibold mt-1">{summary.failed}</p>
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
                                setMonth(e.target.value as any);
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
                                setStatus(e.target.value as any);
                                setPage(1);
                            }}
                            className="input-field bg-white w-full"
                        >
                            <option value="all">All</option>
                            <option value="success">Success</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={tType}
                            onChange={(e) => {
                                setTType(e.target.value as any);
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
                                    setSortKey(e.target.value as any);
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
                                    setSortDir(e.target.value as any);
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

                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
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
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-1 rounded ${p === page ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
