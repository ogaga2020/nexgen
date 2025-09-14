'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import AdminList from '@/components/AdminList';

type CreateAdminForm = {
    fullName: string;
    email: string;
    phone: string;
    password: string;
};

type ApiResponse = { ok?: boolean; message?: string };

const NG_PHONE_REGEX =
    /^(?:\+?234|0)(?:70|80|81|90|91|701|702|703|704|705|706|707|708|709|802|803|804|805|806|807|808|809|810|811|813|814|815|816|817|818|819|901|902|903|904|905|906|907|908|909)\d{7}$/;

export default function CreateAdminPage() {
    const [form, setForm] = useState<CreateAdminForm>({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);

    const isValid = useMemo(() => {
        if (!form.fullName.trim()) return false;
        if (!/\S+@\S+\.\S+/.test(form.email)) return false;
        if (!NG_PHONE_REGEX.test(form.phone.replace(/\s+/g, ''))) return false;
        if (form.password.length < 6) return false;
        return true;
    }, [form]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const normalizePhone = (s: string) => s.replace(/\s+/g, '');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid) {
            if (!form.fullName.trim()) return toast.error('Full name is required.', { duration: 5000 });
            if (!/\S+@\S+\.\S+/.test(form.email)) return toast.error('Enter a valid email.', { duration: 5000 });
            if (!NG_PHONE_REGEX.test(normalizePhone(form.phone))) return toast.error('Enter a valid Nigerian phone number.', { duration: 5000 });
            if (form.password.length < 6) return toast.error('Password must be at least 6 characters.', { duration: 5000 });
        }
        setLoading(true);
        try {
            const payload = { ...form, phone: normalizePhone(form.phone) };
            const { data } = await axios.post<ApiResponse>('/api/admin/create', payload);

            if (data?.ok === false) {
                toast.error(data.message || 'Creation failed', { duration: 5000 });
            } else {
                toast.success('Admin account created. Invitation email sent.', { duration: 3000 });
                setForm({ fullName: '', email: '', phone: '', password: '' });
                setShowPw(false);
                const evt = new Event('admins:refresh');
                window.dispatchEvent(evt);
            }
        } catch (err: unknown) {
            let msg = 'Creation failed';
            if (axios.isAxiosError(err)) {
                const serverMsg =
                    (err.response?.data as { error?: string; message?: string } | undefined)?.error ??
                    err.response?.data?.message;
                msg = serverMsg || err.message || msg;
            } else if (err instanceof Error) {
                msg = err.message || msg;
            }
            toast.error(msg, { duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4">
            <div className="bg-gradient-to-r from-green-800 to-green-500 text-white rounded-md p-6 mb-8">
                <h1 className="text-3xl font-bold">Admins</h1>
                <p className="text-lg mt-1">Create a new admin and manage existing admins.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-4 border rounded-lg shadow-sm mb-8">
                <div className="text-sm text-gray-600 mb-4">
                    Fill in the details below. The new admin will receive a welcome email.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={form.fullName}
                            onChange={onChange}
                            placeholder="Jane Doe"
                            autoComplete="name"
                            className="input-field w-full bg-white"
                            aria-invalid={!form.fullName.trim()}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            placeholder="jane@example.com"
                            autoComplete="email"
                            className="input-field w-full bg-white"
                            aria-invalid={!/\S+@\S+\.\S+/.test(form.email)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            placeholder="+234 801 234 5678"
                            autoComplete="tel"
                            className="input-field w-full bg-white"
                            aria-invalid={!NG_PHONE_REGEX.test(form.phone.replace(/\s+/g, ''))}
                        />
                        <p className="text-xs text-gray-500 mt-1">Example: +2348012345678 or 08012345678</p>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                className="input-field w-full bg-white pr-16"
                                aria-invalid={form.password.length < 6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded"
                                aria-pressed={showPw}
                                aria-label={showPw ? 'Hide password' : 'Show password'}
                            >
                                {showPw ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">The new admin can change their password later via “Forgot password”.</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !isValid}
                        className="bg-[var(--primary)] text-white px-6 py-2 rounded-md hover:bg-[var(--primary-hover)] disabled:opacity-60"
                    >
                        {loading ? 'Creating…' : 'Create Admin'}
                    </button>
                </div>
            </form>

            <AdminList />
        </div>
    );
}
