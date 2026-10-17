'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { API_BASE } from '../../lib/api';

const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(0); 

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function sendCode(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send the code');

      toast.success(data.message || 'Code sent');
      setStep('reset');
      setWait(60);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not reset the password');

      toast.success('Password changed. Please log in.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <KeyRound size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Forgot password</h1>

      {step === 'email' ? (
        <>
          <p className="mt-2 text-sm text-slate-600">
            Enter the email you registered with. We will send you a 6-digit code.
          </p>
          <form onSubmit={sendCode} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
            <div>
              <label className={label}>Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className={field}
              />
            </div>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              {loading ? 'Sending...' : 'Send code'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-500">
            Only accounts made with an email can be reset this way.
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-600">
            If <b>{email}</b> is registered, we sent a 6-digit code to it. Enter it below with a new password.
          </p>
          <form onSubmit={resetPassword} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
            <div>
              <label className={label}>6-digit code</label>
              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className={`${field} mono tracking-[0.4em]`}
              />
            </div>
            <div>
              <label className={label}>New password</label>
              <input
                required
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={field}
              />
              <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
            </div>
            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {loading ? 'Changing...' : 'Change password'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => { setOtp(''); setStep('email'); }}
              className="text-slate-600 hover:text-slate-900"
            >
              Use a different email
            </button>
            <button
              type="button"
              disabled={wait > 0 || loading}
              onClick={() => sendCode()}
              className="font-medium text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {wait > 0 ? `Send again in ${wait}s` : 'Send code again'}
            </button>
          </div>
        </>
      )}

      <p className="mt-8 text-center text-sm text-slate-600">
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">Back to login</Link>
      </p>
    </main>
  );
}8