'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const emailQS = sp.get('email') || '';

  const [email, setEmail] = useState(emailQS);
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);

  const LOGO_URL = 'https://branition.com/assets/img/users/logos/4741-iHZXCVg.webp';

  useEffect(() => {
    setEmail(emailQS || '');
  }, [emailQS]);

  const strength = useMemo(() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[a-z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 5);
  }, [pw]);

  const submit = async () => {
    if (!email) return toast.error('Missing email');
    if (pw.length < 8) return toast.error('Password must be at least 8 characters');
    if (pw !== pw2) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await axios.post('/api/admin/reset', { email, password: pw, confirm: pw2 }, { withCredentials: true });
      toast.success('Password reset successful. Please sign in.');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white py-12 px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mt-4">Set New Password</h1>
        <p className="opacity-90">Choose a strong password to secure your admin account.</p>
      </section>

      <div className="min-h-[60vh] flex items-start justify-center bg-white px-4">
        <div className="w-full max-w-xl -mt-12 bg-white shadow-lg rounded-xl border p-6 md:p-8">
          <div className="mb-5">
            <label className="block text-sm mb-1 text-gray-700">Admin Email</label>
            <input type="email" value={email} readOnly className="input-field mb-1 bg-gray-50 cursor-not-allowed" />
          </div>

          <div className="mb-5">
            <label className="block text-sm mb-1 text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="input-field pr-12 bg-white"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto text-sm text-gray-600 hover:text-gray-800"
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded mt-3">
              <div
                className="h-2 rounded transition-all"
                style={{
                  width: `${(strength / 5) * 100}%`,
                  background: strength <= 2 ? '#f43f5e' : strength === 3 ? '#f59e0b' : '#10b981'
                }}
              />
            </div>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>Use at least 8 characters</li>
              <li>Mix uppercase, lowercase, numbers, and symbols for a stronger password</li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-1 text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showPw2 ? 'text' : 'password'}
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                className="input-field pr-12 bg-white"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowPw2((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto text-sm text-gray-600 hover:text-gray-800"
              >
                {showPw2 ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading || !email}
            className="w-full py-3 rounded-md bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save New Password'}
          </button>

          <div className="text-center mt-4">
            <button onClick={() => router.push('/admin')} className="text-[var(--accent)] hover:underline">
              Back to login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
