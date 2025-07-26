'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

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

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [filter, setFilter] = useState<'all' | 'not_paid' | 'partially_paid' | 'fully_paid'>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        axios.get('/api/admin/users').then((res) => setUsers(res.data));
    }, []);

    const filteredUsers =
        filter === 'all' ? users : users.filter((u) => u.paymentStatus === filter);

    return (
        <>
            <div className="max-w-6xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-ui font-semibold mb-6 text-primary">Admin Dashboard</h1>

                <div className="flex gap-4 mb-6">
                    {['all', 'fully_paid', 'partially_paid', 'not_paid'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as any)}
                            className={`px-4 py-1 rounded-md font-ui border ${filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                                }`}
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
                                <th className="px-4 py-2">View</th>
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
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="text-blue-600 underline"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No users found.</p>
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedUser && (
                <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </>
    );
}

// Modal Component
function UserDetailsModal({
    user,
    onClose,
}: {
    user: User | null;
    onClose: () => void;
}) {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-xl font-ui font-semibold text-primary mb-4">
                    {user.fullName}'s Profile
                </h2>

                <div className="space-y-4">
                    <div>
                        <p>
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p>
                            <strong>Phone:</strong> {user.phone}
                        </p>
                        <p>
                            <strong>Training:</strong> {user.trainingType}
                        </p>
                        <p>
                            <strong>Duration:</strong> {user.trainingDuration} months
                        </p>
                        <p>
                            <strong>Status:</strong>{' '}
                            <span
                                className={`px-2 py-1 text-sm rounded ${user.paymentStatus === 'fully_paid'
                                        ? 'bg-success text-white'
                                        : user.paymentStatus === 'partially_paid'
                                            ? 'bg-warning text-black'
                                            : 'bg-danger text-white'
                                    }`}
                            >
                                {user.paymentStatus.replace('_', ' ')}
                            </span>
                        </p>
                    </div>

                    <div className="mt-4 border-t pt-4">
                        <h3 className="font-ui font-semibold mb-2">Guarantor Info</h3>
                        {user.guarantor ? (
                            <div>
                                <p>
                                    <strong>Name:</strong> {user.guarantor.fullName}
                                </p>
                                <p>
                                    <strong>Email:</strong> {user.guarantor.email}
                                </p>
                                <p>
                                    <strong>Phone:</strong> {user.guarantor.phone}
                                </p>
                                {user.guarantor.photo && (
                                    <img
                                        src={user.guarantor.photo}
                                        alt="Guarantor"
                                        className="w-24 h-24 rounded-md mt-2"
                                    />
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">No guarantor info</p>
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
