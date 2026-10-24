'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ShieldX } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Skeleton } from './blood/ui';

function Notice({ icon, tone, title, text, children }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 text-center">
      <motion.span
        initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg ${tone}`}
      >
        {icon}
      </motion.span>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-2xl font-semibold text-slate-900">
        {title}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="mt-2 text-sm leading-relaxed text-slate-600">
        {text}
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-7 flex flex-wrap justify-center gap-3">
        {children}
      </motion.div>
    </main>
  );
}

export default function RoleGate({ roles, deniedText = 'Your account does not have permission to open this page.', children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-6 py-14">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-72" />
      </main>
    );
  }

  if (!user) {
    return (
      <Notice icon={<Lock size={34} />} tone="bg-indigo-100 text-indigo-600 shadow-indigo-600/20" title="Please log in" text="You need to log in to open this page. It only takes a moment.">
        <Link href="/login" className="rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700">
          Login
        </Link>
        <Link href="/register" className="rounded-full border border-slate-300/70 bg-white/80 px-7 py-3 text-sm font-medium text-slate-700 hover:bg-white">
          Create an account
        </Link>
      </Notice>
    );
  }

  if (!user.roles.some((r) => roles.includes(r))) {
    return (
      <Notice icon={<ShieldX size={34} />} tone="bg-slate-200 text-slate-600 shadow-slate-400/20" title="Not allowed" text={deniedText}>
        <Link href="/" className="rounded-full bg-slate-900 px-7 py-3 text-sm font-medium text-white hover:bg-slate-800">
          Back to home
        </Link>
      </Notice>
    );
  }

  return children;
}