'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Ban, ExternalLink, EyeOff, Flag, RotateCcw, Trash2 } from 'lucide-react';
import { useAdminData, adminAction, useRunner } from '../../lib/useAdminData';
import { timeAgo } from '../../lib/sos';
import { Pills, EmptyBox, Loading, cardClass, btnGreen, btnRed, btnGray } from './shared';

const filters = [['reported', 'Reported'], ['hidden', 'Hidden'], ['recent', 'Recent comments']];

export default function CommentsTab() {
  const [filter, setFilter] = useState('reported');
  const { data, loading, reload } = useAdminData(`/comments?status=${filter}`);
  const { busyId, run } = useRunner(reload);

  const restore = (c) => run(c._id, () => adminAction('PATCH', `/comments/${c._id}/restore`), 'Comment is visible again');
  const hide = (c) => run(c._id, () => adminAction('PATCH', `/comments/${c._id}/hide`), 'Comment hidden');

  function remove(c) {
    if (!window.confirm('Remove this comment for good?')) return;
    run(c._id, () => adminAction('PATCH', `/comments/${c._id}/remove`), 'Comment removed');
  }

  async function blockAuthor(c) {
    if (!window.confirm(`Block ${c.authorName}? They will not be able to use their account.`)) return;
    try {
      await adminAction('PATCH', `/users/${c.author}/block`, { blocked: true });
      toast.success('User blocked');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <Pills options={filters} value={filter} onChange={setFilter} />

      {filter === 'reported' && (
        <p className="rounded-xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
          Comments reported by 3 different people are hidden automatically. Press Keep visible if a comment is fine, and it will not be hidden again.
        </p>
      )}

      {loading && data.length === 0 ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyBox text={filter === 'reported' ? 'No comment needs review.' : 'No comments here.'} />
      ) : (
        <div className="space-y-4">
          {data.map((c) => {
            const busy = busyId === c._id;
            return (
              <div key={c._id} className={cardClass}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{c.authorName}</p>
                  <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                  {c.status === 'hidden' && (
                    <span className="flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      <EyeOff size={12} /> Hidden
                    </span>
                  )}
                  {c.reportCount > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      <Flag size={12} /> {c.reportCount} {c.reportCount === 1 ? 'report' : 'reports'}
                    </span>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-line break-words rounded-xl bg-white/70 p-3 text-sm text-slate-800">{c.text}</p>

                {c.reasons.length > 0 && <p className="mt-2 text-xs text-slate-600">Reasons: {c.reasons.join(', ')}</p>}
                {c.news && (
                  <Link href={`/news/${c.news._id}`} className="mt-2 flex w-fit items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline">
                    <ExternalLink size={12} /> On: {c.news.title}
                  </Link>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {c.status === 'hidden' || filter === 'reported' ? (
                    <button disabled={busy} onClick={() => restore(c)} className={btnGreen}>
                      <RotateCcw size={14} /> Keep visible
                    </button>
                  ) : null}
                  {c.status === 'visible' && (
                    <button disabled={busy} onClick={() => hide(c)} className={btnGray}>
                      <EyeOff size={14} /> Hide
                    </button>
                  )}
                  <button disabled={busy} onClick={() => remove(c)} className={btnRed}>
                    <Trash2 size={14} /> Remove
                  </button>
                  <button disabled={busy} onClick={() => blockAuthor(c)} className={btnGray}>
                    <Ban size={14} /> Block the user
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}9