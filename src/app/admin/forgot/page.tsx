'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const router = useRouter();

    const LOGO_URL = 'https://branition.com/assets/img/users/logos/4741-iHZXCVg.webp';

    useEffect(() => {
        if (!cooldown) return;
        const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const handleRequestOtp = async () => {
        if (!email) return toast.error('Enter your admin email');
        setLoading(true);
        try {
            await axios.post('/api/admin/forgot', { email });
            toast.success('A verification code has been sent to your email.');
            setStep('verify');
            setCooldown(45);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown) return;
        try {
            await axios.post('/api/admin/forgot', { email });
            toast.success('Code resent');
            setCooldown(45);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Unable to resend');
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.trim().length < 4) return toast.error('Enter the code we sent');
        setLoading(true);
        try {
            await axios.post('/api/admin/verify-otp', { email, otp: otp.trim() });
            toast.success('Verified. You can now log in.');
            router.push('/admin');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white py-12 px-6 text-center">
                <button onClick={() => router.push('/admin')} className="inline-flex items-center justify-center">
                    <img
                        src={LOGO_URL}
                        alt="NexGen Logo"
                        className="w-[75px] h-auto rounded-full shadow-lg"
                        loading="lazy"
                    />
                </button>
                <h1 className="text-3xl md:text-4xl font-bold mt-4">Forgot Password</h1>
                <p className="opacity-90">
                    {step === 'request'
                        ? 'Enter your admin email to receive a verification code.'
                        : 'Enter the verification code sent to your email.'}
                </p>
            </section>

            <div className="min-h-[60vh] flex items-start justify-center bg-white px-4">
                <div className="w-full max-w-md -mt-12 bg-white shadow-lg rounded-xl border p-6 md:p-8">
                    {step === 'request' ? (
                        <>
                            <label className="block text-sm mb-1 text-gray-700">Admin Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="input-field mb-6 bg-white"
                                autoComplete="email"
                            />
                            <button
                                onClick={handleRequestOtp}
                                disabled={loading || !email}
                                className="w-full py-3 rounded-md bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
                            >
                                {loading ? 'Sending…' : 'Send Verification Code'}
                            </button>
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="text-[var(--accent)] hover:underline"
                                >
                                    Back to login
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-6">
                                <p className="text-sm text-gray-600">
                                    We sent a code to <span className="font-medium">{email}</span>
                                </p>
                            </div>

                            <label className="block text-sm mb-1 text-gray-700">Verification Code</label>
                            <input
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\s/g, ''))}
                                placeholder="Enter 6-digit code"
                                className="input-field mb-4 bg-white text-center tracking-widest"
                                autoComplete="one-time-code"
                            />

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length < 4}
                                className="w-full py-3 rounded-md bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
                            >
                                {loading ? 'Verifying…' : 'Verify Code'}
                            </button>

                            <div className="mt-4 flex items-center justify-between text-sm">
                                <button
                                    onClick={() => setStep('request')}
                                    className="text-[var(--accent)] hover:underline"
                                >
                                    Use a different email
                                </button>
                                <button
                                    onClick={handleResend}
                                    disabled={!!cooldown}
                                    className={`${cooldown ? 'opacity-60 cursor-not-allowed' : 'text-[var(--accent)] hover:underline'
                                        }`}
                                >
                                    {cooldown ? `Resend in ${cooldown}s` : 'Resend code'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
