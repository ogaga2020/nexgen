'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useNotifier } from '@/components/Notifier';

type Guarantor = { fullName: string; email: string; phone: string; photo: string };
type User = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    photo?: string;
    trainingType: string;
    trainingDuration: number;
    paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid' | string;
    verificationStatus?: 'unverified' | 'verified' | string;
    guarantor?: Guarantor;
};

const ITEMS_PER_PAGE = 20;

export default function StudentsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'fully_paid' | 'partially_paid' | 'not_paid'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const { error, success } = useNotifier();
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const filterWrapRef = useRef<HTMLDivElement | null>(null);

    const fetchUsers = async (page = 1, f = filter, q = search) => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page };
            if (f !== 'all') params.filter = f;
            if (q.trim()) params.search = q.trim();
            const r = await axios.get('/api/admin/users', { params, headers: { 'cache-control': 'no-cache' } });
            setUsers(r.data.users || []);
            setTotal(r.data.total || 0);
            setCurrentPage(page);
        } catch (e: any) {
            setUsers([]);
            error(e?.response?.data?.error || e?.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!filterWrapRef.current) return;
            if (!filterWrapRef.current.contains(e.target as Node)) setFilterMenuOpen(false);
        };
        if (filterMenuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [filterMenuOpen]);

    const labelFor = (f: 'all' | 'fully_paid' | 'partially_paid' | 'not_paid') =>
        f === 'all' ? 'All' : f === 'fully_paid' ? 'Fully paid' : f === 'partially_paid' ? 'Partially paid' : 'Unpaid';

    const setFilterAndClose = (val: 'all' | 'fully_paid' | 'partially_paid' | 'not_paid') => {
        setFilter(val);
        setCurrentPage(1);
        setFilterMenuOpen(false);
        fetchUsers(1, val, search);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'fully_paid') return <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">Fully paid</span>;
        if (status === 'partially_paid') return <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-400 text-black">Partially paid</span>;
        if (status === 'not_paid') return <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-300 text-gray-800">Unpaid</span>;
        return <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700">{status}</span>;
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            const newTotal = Math.max(0, total - 1);
            const lastPage = Math.max(1, Math.ceil(newTotal / ITEMS_PER_PAGE));
            const target = currentPage > lastPage ? lastPage : currentPage;
            success('Student deleted');
            fetchUsers(target, filter, search);
        } catch (e: any) {
            error(e?.response?.data?.error || e?.message || 'Failed to delete');
        }
    };

    const handleExport = () => {
        try {
            const sheetData = users.map((u) => ({
                Name: u.fullName,
                Email: u.email,
                Phone: u.phone,
                Training: u.trainingType,
                Duration: `${u.trainingDuration} months`,
                Status: u.paymentStatus === 'fully_paid' ? 'Fully paid' : u.paymentStatus === 'partially_paid' ? 'Partially paid' : 'Unpaid',
                Verification: u.verificationStatus === 'verified' ? 'Verified' : 'Unverified',
            }));
            const ws = XLSX.utils.json_to_sheet(sheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Students');
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'students.xlsx');
            success(`Exported ${sheetData.length} students`);
        } catch (e: any) {
            error(e?.message || 'Failed to export');
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto py-10 px-4">
                <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 mb-8">
                    <h1 className="text-3xl font-bold">Students</h1>
                    <p className="text-lg mt-1">Manage student registrations and payments</p>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center w-full md:w-auto gap-2">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => {
                                const v = e.target.value;
                                setSearch(v);
                                fetchUsers(1, filter, v);
                            }}
                            className="input-field w-full md:w-96"
                        />

                        <div ref={filterWrapRef} className="relative">
                            <button onClick={() => setFilterMenuOpen((v) => !v)} className="border rounded px-3 py-2 flex items-center gap-2 hover:bg-gray-100 bg-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
                                </svg>
                                {labelFor(filter)}
                            </button>

                            {filterMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 z-20 w-44 rounded-md border bg-white shadow">
                                    {(['all', 'fully_paid', 'partially_paid', 'not_paid'] as const).map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setFilterAndClose(opt)}
                                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${filter === opt ? 'bg-gray-100 font-medium' : ''}`}
                                        >
                                            {labelFor(opt)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={handleExport} className="bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--primary-hover)] transition">
                        Export to Excel
                    </button>
                </div>

                <div className="overflow-x-auto rounded-lg shadow bg-white">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="px-5 py-3 text-left">Name</th>
                                <th className="px-5 py-3">Email</th>
                                <th className="px-5 py-3">Phone</th>
                                <th className="px-5 py-3">Training</th>
                                <th className="px-5 py-3">Duration</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-t hover:bg-gray-50 transition">
                                    <td className="px-5 py-3 text-left">
                                        <div className="flex items-center gap-3">
                                            <span className="whitespace-nowrap">{user.fullName}</span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-3 whitespace-nowrap">{user.email}</td>
                                    <td className="px-5 py-3 whitespace-nowrap">{user.phone}</td>
                                    <td className="px-5 py-3 whitespace-nowrap">{user.trainingType}</td>
                                    <td className="px-5 py-3 whitespace-nowrap">{user.trainingDuration} months</td>

                                    <td className="px-5 py-3">
                                        <StatusBadge status={user.paymentStatus} />
                                    </td>

                                    <td className="px-5 py-3 text-right whitespace-nowrap">
                                        <span className="inline-flex items-center gap-3">
                                            <button onClick={() => setSelectedUser(user)} className="text-blue-600 hover:underline">View</button>
                                            <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:underline">Delete</button>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && <p className="text-center text-gray-500 py-10">{loading ? 'Loading…' : 'No students found.'}</p>}
                </div>

                {total > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)) }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => fetchUsers(page, filter, search)}
                                className={`px-3 py-1 rounded ${page === currentPage ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}

                {selectedUser && (
                    <UserDetailsModal
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                        onUpdated={() => fetchUsers(currentPage, filter, search)}
                    />
                )}
            </div>
        </>
    );
}

function UserDetailsModal({
    user,
    onClose,
    onUpdated,
}: {
    user: User;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const { error, success } = useNotifier();
    const [busy, setBusy] = useState(false);

    const verifyAndMarkPartial = async () => {
        try {
            setBusy(true);
            await axios.patch(`/api/admin/users/${user._id}`, { verificationStatus: 'verified' });
            success('Student verified and marked as partially paid');
            onUpdated();
            onClose();
        } catch (e: any) {
            error(e?.response?.data?.error || e?.message || 'Failed to verify');
        } finally {
            setBusy(false);
        }
    };

    const markFullyPaid = async () => {
        try {
            setBusy(true);
            await axios.patch(`/api/admin/users/${user._id}`, { markFullyPaid: true });
            success('Student marked as fully paid');
            onUpdated();
            onClose();
        } catch (e: any) {
            error(e?.response?.data?.error || e?.message || 'Failed to update');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-xl font-semibold text-[var(--primary)] mb-4">{user.fullName}&apos;s Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-4 items-start">
                    <div>{user.photo ? <img src={user.photo} alt={user.fullName} className="w-24 h-24 rounded-md border object-cover" referrerPolicy="no-referrer" /> : <div className="w-24 h-24 rounded-md border bg-gray-100" />}</div>
                    <div className="space-y-2">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>Training:</strong> {user.trainingType}</p>
                        <p><strong>Duration:</strong> {user.trainingDuration} months</p>
                        <p className="flex items-center gap-2">
                            <strong>Status:</strong>
                            <span>{user.paymentStatus === 'fully_paid' ? 'Fully paid' : user.paymentStatus === 'partially_paid' ? 'Partially paid' : 'Unpaid'}</span>
                        </p>
                    </div>
                </div>

                {user.guarantor ? (
                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold mb-2">Guarantor Info</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-4 items-start">
                            <div>{user.guarantor.photo ? <img src={user.guarantor.photo} alt="Guarantor" className="w-24 h-24 rounded-md border object-cover" referrerPolicy="no-referrer" /> : <div className="w-24 h-24 rounded-md border bg-gray-100" />}</div>
                            <div className="space-y-2">
                                <p><strong>Name:</strong> {user.guarantor.fullName}</p>
                                <p><strong>Email:</strong> {user.guarantor.email}</p>
                                <p><strong>Phone:</strong> {user.guarantor.phone}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex items-center justify-end gap-3 mt-6">
                    {user.verificationStatus !== 'verified' && user.paymentStatus === 'not_paid' && (
                        <button disabled={busy} onClick={verifyAndMarkPartial} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60">
                            Verify & Mark Partial
                        </button>
                    )}
                    {user.paymentStatus === 'partially_paid' && (
                        <button disabled={busy} onClick={markFullyPaid} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60">
                            Mark Fully Paid
                        </button>
                    )}
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Close</button>
                </div>
            </div>
        </div>
    );
}
