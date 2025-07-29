'use client';

import { useEffect, useState, useMemo } from 'react';
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

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [month, setMonth] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        axios.get('/api/admin/transaction')
            .then(res => {
                if (res.data?.transactions?.length > 0) {
                    setTransactions(res.data.transactions);
                } else {
                    setTransactions([]);
                }
            })
            .catch(() => {
                console.error('Failed to fetch transactions');
            });
    }, []);

    const filtered = useMemo(() => {
        let list = [...transactions];

        if (month !== 'all') {
            list = list.filter((t) => {
                const m = new Date(t.createdAt).toLocaleString('default', { month: 'long' });
                return m === month;
            });
        }

        list.sort((a, b) => {
            const nameA = a.user.fullName.toLowerCase();
            const nameB = b.user.fullName.toLowerCase();
            return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });

        return list;
    }, [transactions, month, sortOrder]);

    const exportToCSV = () => {
        const sheetData = filtered.map(t => ({
            Name: t.user.fullName,
            Email: t.user.email,
            Phone: t.user.phone,
            Amount: `₦${t.amount.toLocaleString()}`,
            Type: t.type,
            Reference: t.reference,
            Status: t.status,
            Date: new Date(t.createdAt).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        const buffer = new ArrayBuffer(blob.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < blob.length; i++) {
            view[i] = blob.charCodeAt(i) & 0xff;
        }

        const excelBlob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(excelBlob, 'transactions.xlsx');
    };

    const months = ['all', ...Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString('default', { month: 'long' })
    )];

    return (
        <>
            <AdminNavbar />
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-ui font-semibold text-primary">Transactions</h1>
                    <button
                        onClick={exportToCSV}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800"
                    >
                        Export to Excel
                    </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <select
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        className="border rounded px-3 py-1"
                    >
                        {months.map(m => (
                            <option key={m} value={m}>{m === 'all' ? 'All Months' : m}</option>
                        ))}
                    </select>

                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as any)}
                        className="border rounded px-3 py-1"
                    >
                        <option value="asc">Name A–Z</option>
                        <option value="desc">Name Z–A</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border text-sm bg-white shadow">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Reference</th>
                                <th className="px-4 py-2">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(t => (
                                <tr key={t._id} className="border-t">
                                    <td className="px-4 py-2">{t.user.fullName}</td>
                                    <td className="px-4 py-2">{t.user.email}</td>
                                    <td className="px-4 py-2">₦{t.amount.toLocaleString()}</td>
                                    <td className="px-4 py-2">{t.type}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'success'
                                            ? 'bg-success text-white'
                                            : t.status === 'pending'
                                                ? 'bg-warning text-black'
                                                : 'bg-danger text-white'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{t.reference}</td>
                                    <td className="px-4 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filtered.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No transactions found.</p>
                    )}
                </div>
            </div>
        </>
    );
}
