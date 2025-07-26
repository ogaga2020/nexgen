'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'request' | 'verify'>('request');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRequestOtp = async () => {
        setLoading(true);
        try {
            await axios.post('/api/admin/forgot', { email });
            toast.success('OTP sent to your email');
            setStep('verify');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            await axios.post('/api/admin/verify-otp', { email, otp });
            toast.success('Verified. You can now log in.');
            setTimeout(() => router.push('/admin'), 1000);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
                <div className="flex justify-center mb-4">
                    <button onClick={() => router.push('/admin')}>
                        <Image
                            src="/logo.png"
                            alt="NexGen Logo"
                            width={120}
                            height={40}
                            priority
                        />
                    </button>
                </div>

                <h2 className="text-xl font-bold text-center text-primary mb-4">
                    Forgot Password
                </h2>

                {step === 'request' ? (
                    <>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your admin email"
                            className="input-field mb-4"
                        />
                        <button
                            onClick={handleRequestOtp}
                            className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-800 transition"
                            disabled={loading}
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="input-field mb-4"
                        />
                        <button
                            onClick={handleVerifyOtp}
                            className="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-800 transition"
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
