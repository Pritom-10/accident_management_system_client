'use client';

import { Newspaper } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import NewsForm from '../../../components/NewsForm';
import { useAuth } from '../../../components/AuthProvider';

function Writer() {
  const { user } = useAuth();
  const isAdmin = user.roles.includes('admin');

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <Newspaper size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Write news</h1>
      <p className="mt-2 text-sm text-slate-600">
        {isAdmin ? 'Your story goes live as soon as you publish it.' : 'Your story will be checked by an admin before it goes live.'}
      </p>
      <div className="mt-8">
        <NewsForm isAdmin={isAdmin} />
      </div>
    </main>
  );
}

export default function WriteNewsPage() {
  return (
    <RoleGate roles={['admin', 'journalist']} deniedText="Only admins and journalists can write news.">
      <Writer />
    </RoleGate>
  );
}