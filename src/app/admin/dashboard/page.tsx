'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Types
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
    const [filter, setFilter] = useState<'all' | 'not_paid' | 'partially_paid' | 'fully_paid'>('all');
    const router = useRouter();

    useEffect(() => {
        axios.get('/api/admin/users').then((res) => setUsers(res.data.users));
    }, []);

    const filteredUsers =
        filter === 'all' ? users : users.filter((u) => u.paymentStatus === filter);

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-ui font-semibold mb-6 text-primary">Admin Dashboard</h1>

            <div className="flex gap-4 mb-6">
                {['all', 'fully_paid', 'partially_paid', 'not_paid'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status as any)}
                        className={`px-4 py-1 rounded-md font-ui border ${filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                        {status.replace('_', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border text-sm bg-white shadow">
                    <thead className="bg-gray-100">
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
                    className="bg-primary text-white px-6 py-2 rounded-md font-ui hover:bg-blue-800"
                >
                    View All Students
                </button>
            </div>
        </div>
    );
}
