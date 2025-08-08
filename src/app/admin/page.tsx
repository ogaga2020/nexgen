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
            .catch(() => setShowCreate(true));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            await axios.post('/api/admin/create', form);
            toast.success('Admin created! You can now log in.');
            setShowCreate(false);
            setForm((p) => ({ ...p, fullName: '', phone: '' }));
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Error creating admin');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            await axios.post('/api/admin/login', {
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-gray-500">Checking setup...</p>
            </div>
        );
    }

    return (
        <>
            <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white py-16 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">NexGen Admin</h1>
                <p className="text-lg md:text-xl opacity-90">
                    {showCreate ? 'Create the first admin account' : 'Sign in to continue'}
                </p>
            </section>

            <div className="min-h-[60vh] flex items-start justify-center bg-white px-4">
                <div className="w-full max-w-md -mt-12 bg-white shadow-lg rounded-xl border p-6 md:p-8">
                    <h2 className="text-2xl font-semibold text-[var(--primary)] text-center mb-6">
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
                                className="input-field mb-3 bg-white"
                                autoComplete="name"
                            />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className="input-field mb-3 bg-white"
                                autoComplete="email"
                            />
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Phone"
                                className="input-field mb-3 bg-white"
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
                            className="input-field mb-3 bg-white"
                            autoComplete="email"
                        />
                    )}

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="input-field mb-6 bg-white"
                        autoComplete="current-password"
                    />

                    <button
                        onClick={showCreate ? handleCreate : handleLogin}
                        className="w-full py-3 rounded-md bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : showCreate ? 'Create Admin' : 'Login'}
                    </button>

                    {!showCreate && (
                        <div className="text-sm text-right mt-4">
                            <button
                                onClick={() => router.push('/admin/forgot')}
                                className="text-[var(--accent)] hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
