'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ref = searchParams.get('ref');

    useEffect(() => {
        if (!ref) {
            router.replace('/');
        }
    }, [ref, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-md rounded-md p-6 text-center">
                <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful</h1>
                <p className="text-gray-600">Thank you for registering. Your payment has been received.</p>
                {ref && (
                    <p className="text-sm mt-2 text-gray-500">
                        Reference: <span className="font-mono">{ref}</span>
                    </p>
                )}

                <button
                    onClick={() => router.push('/')}
                    className="mt-6 px-6 py-2 bg-primary text-white rounded hover:bg-blue-800 transition"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
