'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FileText, Pencil, Trash2, Plus, BadgeCheck } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import { API_BASE, apiFetch } from '../../../lib/api';
import { PageHero } from '../../../components/ui/kit';
import { formatDateTime } from '../../../lib/newsOptions';

const statusStyle = {
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  merged: 'bg-slate-200 text-slate-600',
};
const statusText = { pending: 'Waiting for review', published: 'Published', rejected: 'Not approved',  merged: 'Merged into another story', };

function MyPosts() {
  const [posts, setPosts] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE}/news/mine`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Could not load your posts');
      setPosts(data);
    } catch (err) {
      toast.error(err.message);
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function remove(p) {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try {
      const res = await apiFetch(`${API_BASE}/news/${p._id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not delete');
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
        <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
           <PageHero
        icon={<FileText size={24} />}
        tone="indigo"
        eyebrow="Your stories"
        title="My posts"
        subtitle="See what is waiting for review, what is live, and what was not approved."
        actions={
          <Link href="/news/write" className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-700">
            <Plus size={16} /> Write news
          </Link>
        }
      />

      <div className="mt-8 space-y-4">
        {posts === null ? (
          <p className="text-sm text-slate-600">Loading...</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
            You have not written anything yet.
          </div>
        ) : (
          posts.map((p) => (
            <div key={p._id} className="rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[p.status]}`}>
                  {statusText[p.status]}
                </span>
                {p.status === 'published' && p.isVerified && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    <BadgeCheck size={13} /> Verified
                  </span>
                )}
              </div>

              <h2 className="mt-3 text-lg font-semibold text-slate-900">{p.title}</h2>
              <p className="mono mt-1 text-xs text-slate-500">
                {[p.location?.area, p.location?.district].filter(Boolean).join(', ')} · {formatDateTime(p.occurredAt)}
              </p>

              {p.status === 'rejected' && p.rejectionReason && (
                <p className="mt-2 text-sm text-rose-600">Reason: {p.rejectionReason}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {p.status === 'published' && (
                  <Link href={`/news/${p._id}`} className="rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                    View
                  </Link>
                )}
                <Link href={`/news/${p._id}/edit`} className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <Pencil size={13} /> Edit
                </Link>
                {p.status !== 'published' && (
                  <button onClick={() => remove(p)} className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white hover:bg-rose-700">
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default function MyPostsPage() {
  return (
    <RoleGate roles={['admin', 'journalist']} deniedText="Only admins and journalists have posts.">
      <MyPosts />
    </RoleGate>
  );
}