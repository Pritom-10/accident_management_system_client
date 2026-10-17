'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { LogIn, Loader2 } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import { useAuth } from '../../components/AuthProvider';

const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-sm font-medium text-slate-700';

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
    <main className="mx-auto max-w-md px-6 py-16">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <LogIn size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Login</h1>
      <p className="mt-2 text-sm text-slate-600">Use your email or mobile number.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-6 backdrop-blur-xl">
        <div>
          <label className={label}>Email or mobile number</label>
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="name@email.com or 01712345678"
            className={field}
          />
        </div>
        <div>
          <label className={label}>Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
        </div>

        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}