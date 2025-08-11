'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export default function CreateAdminPage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!form.fullName.trim()) return toast.error('Full name is required.');
        if (!form.email.trim()) return toast.error('Email is required.');
        if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error('Enter a valid email.');
        if (!form.phone.trim()) return toast.error('Phone is required.');
        if (!form.password || form.password.length < 6)
            return toast.error('Password must be at least 6 characters.');

        setLoading(true);
        try {
            await axios.post('/api/admin/create', form);
            toast.success('Admin account created. Invitation email sent.');
            setForm({ fullName: '', email: '', phone: '', password: '' });
            setShowPw(false);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Creation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="bg-gradient-to-r from-green-800 to-green-500 text-white py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold">Create Admin</h1>
                    <p className="opacity-90 mt-1">
                        Add a new administrator for NexGen Flow &amp; Power.
                    </p>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 -mt-8">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border rounded-xl shadow-sm p-6 md:p-8"
                >
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Jane Doe"
                                autoComplete="name"
                                className="input-field bg-white w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="jane@example.com"
                                autoComplete="email"
                                className="input-field bg-white w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="+234 801 234 5678"
                                autoComplete="tel"
                                className="input-field bg-white w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="At least 6 characters"
                                    autoComplete="new-password"
                                    className="input-field bg-white w-full pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                                >
                                    {showPw ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                The new admin can change their password after logging in.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-2 rounded-md disabled:opacity-60"
                        >
                            {loading ? 'Creating…' : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
