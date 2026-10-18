'use client';

import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function WriteNewsLinks() {
  const { user } = useAuth();
  if (!user || !user.roles.some((r) => r === 'admin' || r === 'journalist')) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/news/write"
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
      >
        <Plus size={16} /> Write news
      </Link>
      <Link
        href="/news/mine"
        className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
      >
        <FileText size={16} /> My posts
      </Link>
    </div>
  );
}