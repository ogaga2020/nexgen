'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminEntryPage() {
    const [showCreate, setShowCreate] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
    });

    useEffect(() => {
        axios
            .get('/api/admin/create')
            .then((res) => setShowCreate(!res.data.exists))
            .catch(() => setShowCreate(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/admin/create', form);
            toast.success('Admin created! You can now log in.');
            setForm({ fullName: '', email: '', phone: '', password: '' });
            setTimeout(() => router.push('/admin'), 1000);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error creating admin');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await axios.post('/api/admin/login', {
                email: form.email,
                password: form.password,
            });
            toast.success('Login successful!');
            router.push('/admin/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (showCreate === null) {
        return <p className="text-center py-10 text-gray-500">Checking setup...</p>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md border border-gray-200">
                <h1 className="text-2xl font-bold font-ui text-center text-primary mb-6">
                    NexGen Flow & Power
                </h1>
                <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
                    {showCreate ? 'Create Admin' : 'Admin Login'}
                </h2>

                {showCreate && (
                    <>
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="input-field mb-3"
                            autoComplete="name"
                        />
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="input-field mb-3"
                            autoComplete="email"
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Phone"
                            className="input-field mb-3"
                            autoComplete="tel"
                        />
                    </>
                )}

                {!showCreate && (
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        className="input-field mb-3"
                        autoComplete="email"
                    />
                )}

                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="input-field mb-4"
                    autoComplete="current-password"
                />

                <button
                    onClick={showCreate ? handleCreate : handleLogin}
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-800 transition"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : showCreate ? 'Create Admin' : 'Login'}
                </button>
            </div>
        </div>
    );
}
