'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export type User = {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    trainingType: string;
    trainingDuration: number;
    paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid';
};

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] =
        useState<'all' | 'not_paid' | 'partially_paid' | 'fully_paid'>('all');
    const router = useRouter();

    useEffect(() => {
        axios.get('/api/admin/users').then((res) => setUsers(res.data.users || []));
    }, []);

    const filteredUsers = filter === 'all' ? users : users.filter((u) => u.paymentStatus === filter);

    const pill = (key: typeof filter, label: string) => (
        <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1 rounded-md border transition ${filter === key
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white py-10 px-6">
                <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
                <p className="opacity-90">Overview of registrations and payments</p>
            </section>

            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex flex-wrap gap-2 mb-6">
                    {pill('all', 'ALL')}
                    {pill('fully_paid', 'FULLY PAID')}
                    {pill('partially_paid', 'PARTIALLY PAID')}
                    {pill('not_paid', 'NOT PAID')}
                </div>

                <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Phone</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Duration</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="border-t">
                                    <td className="px-4 py-2 text-left">{user.fullName}</td>
                                    <td className="px-4 py-2">{user.email}</td>
                                    <td className="px-4 py-2">{user.phone}</td>
                                    <td className="px-4 py-2">{user.trainingType}</td>
                                    <td className="px-4 py-2">{user.trainingDuration} months</td>
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${user.paymentStatus === 'fully_paid'
                                                ? 'bg-[var(--success)] text-white'
                                                : user.paymentStatus === 'partially_paid'
                                                    ? 'bg-[var(--warning)] text-black'
                                                    : 'bg-[var(--danger)] text-white'
                                                }`}
                                        >
                                            {user.paymentStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No users found.</p>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => router.push('/admin/students')}
                        className="bg-[var(--primary)] text-white px-6 py-2 rounded-md hover:bg-[var(--primary-hover)]"
                    >
                        View All Students
                    </button>
                </div>
            </div>
        </>
    );
}
