'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import AdminNavbar from '@/components/AdminNavbar';

export default function CreateAdminPage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form.fullName || !form.email || !form.phone || !form.password) {
            return toast.error('All fields are required.');
        }

        setLoading(true);
        try {
            await axios.post('/api/admin/create', form);
            toast.success('Admin created and login details sent to email.');
            setForm({ fullName: '', email: '', phone: '', password: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Creation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AdminNavbar />
            <div className="max-w-md mx-auto py-10 px-4">
                <h1 className="text-2xl font-semibold text-primary mb-6">Create New Admin</h1>

                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    className="input-field mb-4"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="input-field mb-4"
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input-field mb-4"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="input-field mb-6"
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-800 w-full"
                >
                    {loading ? 'Creating...' : 'Create Admin'}
                </button>
            </div>
        </>
    );
}
