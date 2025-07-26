'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import AdminNavbar from '@/components/AdminNavbar';

type Guarantor = {
    fullName: string;
    email: string;
    phone: string;
    photo: string;
};

type User = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    trainingType: string;
    trainingDuration: number;
    paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid';
    guarantor?: Guarantor;
};

const ITEMS_PER_PAGE = 20;

export default function StudentsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'fully_paid' | 'partially_paid' | 'not_paid'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        axios.get('/api/admin/users')
            .then((res) => setUsers(res.data.users))
            .catch((err) => {
                console.error('Error loading users:', err);
                setUsers([]);
            });
    }, []);

    const filteredUsers = useMemo(() => {
        let filtered = [...users];

        if (filter !== 'all') {
            filtered = filtered.filter((u) => u.paymentStatus === filter);
        }

        if (search.trim()) {
            const s = search.trim().toLowerCase();
            filtered = filtered.filter((u) =>
                u.fullName.toLowerCase().replace(/\s+/g, '').includes(s.replace(/\s+/g, ''))
            );
        }

        return filtered;
    }, [users, filter, search]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDelete = async (id: string) => {
        const confirm = window.confirm('Are you sure you want to delete this student?');
        if (!confirm) return;

        try {
            await axios.delete(`/api/admin/users/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
        } catch {
            alert('Failed to delete');
        }
    };

    const handleExport = () => {
        const sheetData = filteredUsers.map((u) => ({
            Name: u.fullName,
            Email: u.email,
            Phone: u.phone,
            Training: u.trainingType,
            Duration: `${u.trainingDuration} months`,
            Status: u.paymentStatus,
        }));

        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Students');
        const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        const buffer = new ArrayBuffer(blob.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < blob.length; i++) {
            view[i] = blob.charCodeAt(i) & 0xff;
        }

        const excelBlob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(excelBlob, 'students.xlsx');
    };

    return (
        <>
            <AdminNavbar />

            <div className="max-w-6xl mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-ui font-semibold text-primary">Students</h1>
                    <button
                        onClick={handleExport}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800"
                    >
                        Export to Excel
                    </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input-field w-full md:w-1/2"
                    />

                    <div className="space-x-2">
                        {['all', 'fully_paid', 'partially_paid', 'not_paid'].map((s) => (
                            <button
                                key={s}
                                onClick={() => {
                                    setFilter(s as any);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-1 rounded font-ui border ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                {s.replace('_', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border text-sm bg-white shadow">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Phone</th>
                                <th className="px-4 py-2">Training</th>
                                <th className="px-4 py-2">Duration</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user._id} className="border-t">
                                    <td className="px-4 py-2">{user.fullName}</td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">{user.phone}</td>
                                    <td className="px-4 py-2">{user.trainingType}</td>
                                    <td className="px-4 py-2">{user.trainingDuration} months</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${user.paymentStatus === 'fully_paid'
                                                ? 'bg-success text-white'
                                                : user.paymentStatus === 'partially_paid'
                                                    ? 'bg-warning text-black'
                                                    : 'bg-danger text-white'
                                                }`}
                                        >
                                            {user.paymentStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 space-x-2">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="text-blue-600 underline"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-600 underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No students found.</p>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded ${page === currentPage ? 'bg-primary text-white' : 'bg-gray-200'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}

                {selectedUser && (
                    <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
                )}
            </div>
        </>
    );
}


function UserDetailsModal({ user, onClose }: { user: User; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-xl font-ui font-semibold text-primary mb-4">
                    {user.fullName}'s Details
                </h2>

                <div className="space-y-4">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                    <p><strong>Training:</strong> {user.trainingType}</p>
                    <p><strong>Duration:</strong> {user.trainingDuration} months</p>
                    <p><strong>Status:</strong>
                        <span className={`ml-2 px-2 py-1 text-sm rounded ${user.paymentStatus === 'fully_paid'
                            ? 'bg-success text-white'
                            : user.paymentStatus === 'partially_paid'
                                ? 'bg-warning text-black'
                                : 'bg-danger text-white'}`}
                        >
                            {user.paymentStatus.replace('_', ' ')}
                        </span>
                    </p>

                    <div className="mt-4 border-t pt-4">
                        <h3 className="font-ui font-semibold mb-2">Guarantor Info</h3>
                        {user.guarantor ? (
                            <div>
                                <p><strong>Name:</strong> {user.guarantor.fullName}</p>
                                <p><strong>Email:</strong> {user.guarantor.email}</p>
                                <p><strong>Phone:</strong> {user.guarantor.phone}</p>
                                {user.guarantor.photo && (
                                    <img
                                        src={user.guarantor.photo}
                                        alt="Guarantor"
                                        className="w-24 h-24 rounded-md mt-2"
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">No guarantor info provided.</p>
                        )}
                    </div>
                </div>

                <div className="text-right mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded-md font-ui hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
