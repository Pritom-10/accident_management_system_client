'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Droplet, HeartHandshake, LogIn, Siren } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';
import AuthShell from '../../components/ui/AuthShell';
import { PasswordField, SubmitButton, fieldClass, labelClass } from '../../components/ui/kit';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not log in');

      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
      router.push('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      icon={<LogIn size={24} />}
      title="Welcome back"
      subtitle="Log in with your email or mobile number."
      headline="Help is closer than you think."
      points={[
        { icon: <Siren size={18} />, text: 'Follow your SOS and the volunteers coming to you' },
        { icon: <Droplet size={18} />, text: 'Get blood requests that match your group' },
        { icon: <HeartHandshake size={18} />, text: 'Track your donations and receipts' },
      ]}
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="identifier" className={labelClass}>Email or mobile number</label>
          <input
            id="identifier"
            required
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="name@email.com or 01712345678"
            className={fieldClass}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordField id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <SubmitButton loading={loading} icon={<LogIn size={16} />}>
          {loading ? 'Logging in...' : 'Login'}
        </SubmitButton>
      </form>
    </AuthShell>
  );
}