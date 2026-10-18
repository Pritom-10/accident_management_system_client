'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';

function Notice({ title, text, children }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 text-slate-600">
        <Lock size={26} />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
      <div className="mt-6">{children}</div>
    </main>
  );
}

export default function RoleGate({ roles, deniedText = 'Your account does not have permission to open this page.', children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <main className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-slate-600">Loading...</main>;
  }

  if (!user) {
    return (
      <Notice title="Please log in" text="You need to log in to open this page.">
        <Link href="/login" className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
          Login
        </Link>
      </Notice>
    );
  }

  if (!user.roles.some((r) => roles.includes(r))) {
    return (
      <Notice title="Not allowed" text={deniedText}>
        <Link href="/" className="rounded-full border border-slate-300/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-700">
          Back to home
        </Link>
      </Notice>
    );
  }

  return children;
}