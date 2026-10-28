'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BadgeCheck, KeyRound, Mail, Send } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { useAuth } from '../AuthProvider';
import { PasswordField, SectionCard, SubmitButton, fieldClass, labelClass } from '../ui/kit';

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const slide = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.2 } };

export default function EmailPanel() {
  const { user, refresh } = useAuth();
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function request(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await apiFetch(`${API_BASE}/profile/email/request`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send the code');

      toast.success('We sent a 6-digit code to your email');
      setPassword('');
      setStep('code');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await apiFetch(`${API_BASE}/profile/email/verify`, {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not confirm the email');

      toast.success('Your email is confirmed');
      setCode('');
      setStep('form');
      await refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <SectionCard
        title="Email and password reset"
        hint={user.email ? undefined : 'You signed up with a mobile number. Add an email, or you cannot reset your password if you forget it.'}
      >
        {user.email && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <Mail size={16} /> {user.email}
            {user.emailVerified ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                <BadgeCheck size={12} /> Confirmed
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Not confirmed yet</span>
            )}
          </p>
        )}

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.form key="form" {...slide} onSubmit={request} className="space-y-4">
              <div>
                <label htmlFor="em-new" className={labelClass}>{user.email ? 'Email address' : 'Add an email address'}</label>
                <input id="em-new" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="em-pw" className={labelClass}>Your password</label>
                <PasswordField id="em-pw" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <SubmitButton loading={busy} tone="slate" icon={<Send size={16} />} className="sm:w-fit sm:px-8">
                {busy ? 'Sending...' : user.email && !user.emailVerified ? 'Send a code to confirm' : 'Send the code'}
              </SubmitButton>
            </motion.form>
          ) : (
            <motion.form key="code" {...slide} onSubmit={verify} className="space-y-4">
              <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">Check {email}. Look in spam too.</p>
              <div>
                <label htmlFor="em-code" className={labelClass}>6-digit code</label>
                <input
                  id="em-code"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className={`${fieldClass} mono text-center text-xl tracking-[0.5em] sm:max-w-xs`}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <SubmitButton loading={busy} tone="emerald" icon={<KeyRound size={16} />} className="sm:w-fit sm:px-8">
                  {busy ? 'Checking...' : 'Confirm'}
                </SubmitButton>
                <button type="button" onClick={() => { setCode(''); setStep('form'); }} className="text-sm text-slate-600 hover:text-slate-900">
                  Use a different email
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </SectionCard>
    </div>
  );
}