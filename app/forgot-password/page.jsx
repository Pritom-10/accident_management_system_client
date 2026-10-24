'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { KeyRound, Mail, MailCheck, ShieldCheck, Timer } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import AuthShell from '../../components/ui/AuthShell';
import { PasswordField, SubmitButton, fieldClass, labelClass } from '../../components/ui/kit';

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.22 },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
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
    <AuthShell
      icon={<KeyRound size={24} />}
      iconTone="bg-violet-600 shadow-violet-600/30"
      title="Reset your password"
      subtitle={step === 'email' ? 'We will email you a 6-digit code.' : `We sent a code to ${email}, if it is registered.`}
      headline="Locked out? It takes a minute."
      points={[
        { icon: <Mail size={18} />, text: 'Enter the email you registered with' },
        { icon: <Timer size={18} />, text: 'The code works for 10 minutes' },
        { icon: <ShieldCheck size={18} />, text: 'After 5 wrong tries the code stops working' },
      ]}
      footer={
        <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
          Back to login
        </Link>
      }
    >
      <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.form key="email" {...slide} onSubmit={sendCode} className="space-y-5">
            <div>
              <label htmlFor="reset-email" className={labelClass}>Email</label>
              <input
                id="reset-email"
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className={fieldClass}
              />
              <p className="mt-1.5 text-xs text-slate-500">Only accounts made with an email can be reset this way.</p>
            </div>
            <SubmitButton loading={loading} tone="indigo" icon={<Mail size={16} />}>
              {loading ? 'Sending...' : 'Send code'}
            </SubmitButton>
          </motion.form>
        ) : (
          <motion.form key="reset" {...slide} onSubmit={resetPassword} className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <MailCheck size={20} className="shrink-0" /> Check your inbox. It can take a minute. Look in spam too.
            </div>

            <div>
              <label htmlFor="otp" className={labelClass}>6-digit code</label>
              <input
                id="otp"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className={`${fieldClass} mono py-3.5 text-center text-2xl tracking-[0.5em]`}
              />
            </div>

            <div>
              <label htmlFor="reset-password" className={labelClass}>New password</label>
              <PasswordField id="reset-password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <p className="mt-1.5 text-xs text-slate-500">At least 8 characters.</p>
            </div>

            <SubmitButton loading={loading} tone="indigo" icon={<KeyRound size={16} />}>
              {loading ? 'Changing...' : 'Change password'}
            </SubmitButton>

            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => { setOtp(''); setStep('email'); }} className="text-slate-600 hover:text-slate-900">
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
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}