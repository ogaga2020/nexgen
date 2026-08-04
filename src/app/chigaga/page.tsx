'use client';

import { FormEvent, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { FiArrowRight, FiCheck, FiLock, FiMail, FiPhone, FiShield, FiUser } from 'react-icons/fi';

type FormState = { fullName: string; email: string; phone: string; password: string };

export default function AdminEntryPage() {
  const [setupMode, setSetupMode] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({ fullName: '', email: '', phone: '', password: '' });
  const router = useRouter();

  useEffect(() => {
    axios.get('/api/admin/create', { headers: { 'cache-control': 'no-cache' } })
      .then(({ data }) => setSetupMode(!data.exists))
      .catch(() => {
        setSetupMode(false);
        toast.error('Unable to check the admin setup. Please refresh.');
      });
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (setupMode) {
        await axios.post('/api/admin/create', form);
        toast.success('Superadmin created. Sign in with your new account.');
        setSetupMode(false);
        setForm((current) => ({ ...current, fullName: '', phone: '', password: '' }));
        return;
      }

      await axios.post('/api/admin/login', { email: form.email, password: form.password });
      toast.success('Welcome back.');
      router.push('/chigaga/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (setupMode === null) {
    return (
      <main className="admin-entry-shell">
        <div className="admin-loader" role="status" aria-live="polite">
          <span className="admin-loader-ring"><Image src="/powertrust-icon.png" alt="" width={54} height={54} priority /></span>
          <strong>PowerTrust Operations</strong>
          <small>Checking secure setup…</small>
        </div>
      </main>
    );
  }

  const FieldIcon = setupMode ? FiUser : FiMail;

  return (
    <main className="admin-entry-shell">
      <section className="admin-entry-card">
        <div className="admin-entry-story">
          <Link href="/" className="admin-entry-brand" aria-label="PowerTrust home">
            <span className="admin-entry-logo"><Image src="/powertrust-icon.png" alt="" width={52} height={52} /></span>
            <span><strong>POWER<span>TRUST</span></strong><small>ENERGY LIMITED</small></span>
          </Link>

          <div className="admin-entry-copy">
            <span className="admin-kicker"><FiShield /> Secure operations</span>
            <h1>{setupMode ? 'Create your command centre.' : 'Welcome back to PowerTrust.'}</h1>
            <p>{setupMode
              ? 'No administrator exists yet. This first account becomes the superadmin and can invite the rest of your team.'
              : 'Manage trainees, payments, certificates, projects and the media library from one protected workspace.'}</p>
            <ul>
              <li><FiCheck /> Role-aware team access</li>
              <li><FiCheck /> Protected operational data</li>
              <li><FiCheck /> One clear view of the business</li>
            </ul>
          </div>

          <p className="admin-entry-foot">PowerTrust internal system · Authorised personnel only</p>
        </div>

        <div className="admin-entry-form-wrap">
          <div className="admin-entry-form-head">
            <span>{setupMode ? 'Initial setup' : 'Operations portal'}</span>
            <h2>{setupMode ? 'Create superadmin' : 'Sign in'}</h2>
            <p>{setupMode ? 'Set up the first secure account.' : 'Enter your admin credentials to continue.'}</p>
          </div>

          <form onSubmit={submit} className="admin-entry-form">
            {setupMode && (
              <label>
                <span>Full name</span>
                <div><FieldIcon /><input required name="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Your full name" autoComplete="name" /></div>
              </label>
            )}

            <label>
              <span>Email address</span>
              <div><FiMail /><input required type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" autoComplete="email" /></div>
            </label>

            {setupMode && (
              <label>
                <span>Phone number</span>
                <div><FiPhone /><input required type="tel" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0800 000 0000" autoComplete="tel" /></div>
              </label>
            )}

            <label>
              <span>Password</span>
              <div><FiLock /><input required minLength={6} type="password" name="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 characters" autoComplete={setupMode ? 'new-password' : 'current-password'} /></div>
            </label>

            {!setupMode && <Link href="/chigaga/forgot" className="admin-forgot-link">Forgot password?</Link>}

            <button type="submit" className="admin-entry-submit" disabled={loading}>
              <span>{loading ? 'Please wait…' : setupMode ? 'Create superadmin' : 'Enter workspace'}</span>
              {!loading && <FiArrowRight />}
            </button>
          </form>

          <Link href="/" className="admin-back-link">← Return to public website</Link>
        </div>
      </section>
    </main>
  );
}
