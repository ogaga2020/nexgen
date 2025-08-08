'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AdminNavbar from '@/components/AdminNavbar';

type Transaction = {
    _id: string;
    user: {
        fullName: string;
        email: string;
        phone: string;
    };
    amount: number;
    type: 'initial' | 'balance';
    reference: string;
    status: 'success' | 'failed' | 'pending';
    createdAt: string;
};

type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [month, setMonth] = useState<string>('all');
    const [status, setStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
    const [tType, setTType] = useState<'all' | 'initial' | 'balance'>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    useEffect(() => {
        axios
            .get('/api/admin/transaction')
            .then((res) => setTransactions(res.data?.transactions || []))
            .catch(() => setTransactions([]));
    }, []);

    const months = useMemo(
        () => ['all', ...Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('default', { month: 'long' }))],
        []
    );

    const filtered = useMemo(() => {
        let list = [...transactions];

        if (month !== 'all') {
            list = list.filter((t) => new Date(t.createdAt).toLocaleString('default', { month: 'long' }) === month);
        }
        if (status !== 'all') {
            list = list.filter((t) => t.status === status);
        }
        if (tType !== 'all') {
            list = list.filter((t) => t.type === tType);
        }
        if (search.trim()) {
            const s = search.trim().toLowerCase();
            list = list.filter(
                (t) =>
                    t.user.fullName.toLowerCase().includes(s) ||
                    t.user.email.toLowerCase().includes(s) ||
                    t.reference.toLowerCase().includes(s)
            );
        }

        list.sort((a, b) => {
            if (sortKey === 'date') {
                const da = +new Date(a.createdAt);
                const db = +new Date(b.createdAt);
                return sortDir === 'asc' ? da - db : db - da;
            } else {
                return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
        });

        return list;
    }, [transactions, month, status, tType, search, sortKey, sortDir]);

    const totals = useMemo(() => {
        const success = filtered.filter((t) => t.status === 'success');
        const pending = filtered.filter((t) => t.status === 'pending').length;
        const failed = filtered.filter((t) => t.status === 'failed').length;
        const sumSuccess = success.reduce((acc, t) => acc + t.amount, 0);
        return { sumSuccess, pending, failed };
    }, [filtered]);

    const exportToExcel = () => {
        const sheetData = filtered.map((t) => ({
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
                        <p className="text-2xl font-semibold mt-1">₦{totals.sumSuccess.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Pending</p>
                        <p className="text-2xl font-semibold mt-1">{totals.pending}</p>
                    </div>
                    <div className="bg-white border rounded-xl p-4 shadow-sm">
                        <p className="text-gray-500 text-sm">Failed</p>
                        <p className="text-2xl font-semibold mt-1">{totals.failed}</p>
                    </div>
                </div>

                <div className="bg-white border rounded-xl shadow-sm p-4 mb-6 grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-3 items-end">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Name, email, or reference…"
                            className="input-field bg-white w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field bg-white w-full">
                            {months.map((m) => (
                                <option key={m} value={m}>
                                    {m === 'all' ? 'All Months' : m}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
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
                        <select value={tType} onChange={(e) => setTType(e.target.value as any)} className="input-field bg-white w-full">
                            <option value="all">All</option>
                            <option value="initial">Initial</option>
                            <option value="balance">Balance</option>
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                        <div className="flex gap-2">
                            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="input-field bg-white">
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                            </select>
                            <select value={sortDir} onChange={(e) => setSortDir(e.target.value as SortDir)} className="input-field bg-white">
                                <option value="desc">Desc</option>
                                <option value="asc">Asc</option>
                            </select>
                        </div>
                    </div>

                    <div className="lg:col-start-5 md:col-start-3 sm:col-start-2 flex justify-end">
                        <button
                            onClick={exportToExcel}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-md"
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
                            {filtered.map((t) => (
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
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
