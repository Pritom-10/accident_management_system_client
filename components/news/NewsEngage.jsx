'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Flag, Loader2, MessageCircle, Send, Trash2 } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { REACTIONS } from '../../lib/newsExtras';
import { imageSrc } from '../../lib/imageUrl';
import { timeAgo } from '../../lib/sos';
import { useAuth } from '../AuthProvider';
import { glass } from '../ui/styles';

const MAX = 800;
const REASONS = ['Spam', 'Abusive or hateful', 'False information', 'Other'];
const TONES = [
  'from-rose-400 to-indigo-500',
  'from-emerald-400 to-sky-500',
  'from-amber-400 to-rose-500',
  'from-violet-400 to-indigo-500',
  'from-sky-400 to-emerald-500',
];

function Avatar({ name, photoUrl }) {
  if (photoUrl) {
    return <img src={imageSrc(photoUrl)} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${TONES[(name || '').length % TONES.length]}`}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  );
}

export default function NewsEngage({ newsId }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [reporting, setReporting] = useState(null);
  const [reported, setReported] = useState([]);

  const loadComments = useCallback(
    async (p) => {
      try {
        const res = await apiFetch(`${API_BASE}/engage/news/${newsId}/comments?page=${p}`);
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setComments((prev) => (p === 1 ? data.items : [...prev, ...data.items]));
        setPage(data.page);
        setPages(data.pages);
      } catch {
        toast.error('Could not load the comments');
      } finally {
        setLoading(false);
      }
    },
    [newsId]
  );

  useEffect(() => {
    apiFetch(`${API_BASE}/engage/news/${newsId}/summary`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setSummary)
      .catch(() => setSummary(null));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadComments(1);
  }, [newsId, user?._id, loadComments]);

  async function pick(type) {
    if (!user) {
      toast.error('Please log in to react');
      return;
    }
    if (!summary) return;

    const previous = summary;
    const next = summary.mine === type ? null : type;
    const counts = { ...summary.counts };
    if (summary.mine) counts[summary.mine] = Math.max(0, (counts[summary.mine] || 0) - 1);
    if (next) counts[next] = (counts[next] || 0) + 1;
    setSummary({ ...summary, counts, mine: next });

    try {
      const res = await apiFetch(`${API_BASE}/engage/news/${newsId}/reaction`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: next }),
      });
      if (!res.ok) throw new Error('failed');
      setSummary(await res.json());
    } catch {
      setSummary(previous);
      toast.error('Could not save your reaction');
    }
  }

  async function post(e) {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await apiFetch(`${API_BASE}/engage/news/${newsId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not post your comment');

      setComments((prev) => [data, ...prev]);
      setSummary((s) => (s ? { ...s, commentCount: s.commentCount + 1 } : s));
      setText('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function remove(comment) {
    if (!window.confirm('Delete your comment?')) return;
    try {
      const res = await apiFetch(`${API_BASE}/engage/comments/${comment._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete the comment');
      setComments((prev) => prev.filter((c) => c._id !== comment._id));
      setSummary((s) => (s ? { ...s, commentCount: Math.max(0, s.commentCount - 1) } : s));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function report(comment, reason) {
    try {
      const res = await apiFetch(`${API_BASE}/engage/comments/${comment._id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send your report');

      setReported((prev) => [...prev, comment._id]);
      setReporting(null);
      toast.success('Thank you. An admin will look at this comment.');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <section className={`${glass} mt-6 p-6 md:p-8`}>
      <div className="flex flex-wrap gap-3">
        {REACTIONS.map(({ type, label, icon: Icon, on }) => {
          const active = summary && summary.mine === type;
          return (
            <motion.button
              key={type}
              whileTap={{ scale: 0.9 }}
              onClick={() => pick(type)}
              aria-pressed={Boolean(active)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                active ? on : 'border-slate-300/70 bg-white/80 text-slate-700 hover:bg-white'
              }`}
            >
              <motion.span
                animate={active ? { rotate: [0, -18, 14, 0], scale: [1, 1.3, 1] } : { rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Icon size={17} />
              </motion.span>
              {label}
              <span className="mono text-xs opacity-80">{summary ? summary.counts[type] || 0 : 0}</span>
            </motion.button>
          );
        })}
      </div>

      <h2 className="mt-8 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <MessageCircle size={19} /> Comments{summary ? ` (${summary.commentCount})` : ''}
      </h2>

      {user ? (
        <form onSubmit={post} className="mt-4">
          <textarea
            required
            rows={3}
            maxLength={MAX}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share what you know, or a kind word. No links, please."
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              <span className="mono">{text.length}/{MAX}</span> · Comments are public. Be respectful.
            </p>
            <button
              disabled={posting || text.trim().length < 2}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {posting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Post
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-4 rounded-2xl bg-white/70 p-4 text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">Log in</Link> or{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:underline">create an account</Link> to comment and react.
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/60" />)}
          </div>
        ) : comments.length === 0 ? (
          <p className="rounded-2xl bg-white/50 p-6 text-center text-sm text-slate-500">No comments yet. Be the first.</p>
        ) : (
          <ul className="space-y-5">
            <AnimatePresence initial={false}>
              {comments.map((c) => (
                <motion.li
                  key={c._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="flex gap-3"
                >
                  <Avatar name={c.name} photoUrl={c.photoUrl} />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 text-sm">
                      <span className="font-semibold text-slate-900">{c.name}</span>
                      {c.mine && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">You</span>}
                      <span className="text-xs text-slate-500">{timeAgo(c.createdAt)}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">{c.text}</p>

                    <div className="mt-2 flex items-center gap-4 text-xs">
                      {c.mine ? (
                        <button onClick={() => remove(c)} className="flex items-center gap-1 text-slate-500 hover:text-rose-600">
                          <Trash2 size={13} /> Delete
                        </button>
                      ) : (
                        user &&
                        (reported.includes(c._id) ? (
                          <span className="text-slate-400">Reported</span>
                        ) : (
                          <button onClick={() => setReporting(reporting === c._id ? null : c._id)} className="flex items-center gap-1 text-slate-500 hover:text-rose-600">
                            <Flag size={13} /> Report
                          </button>
                        ))
                      )}
                    </div>

                    <AnimatePresence>
                      {reporting === c._id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mt-2 flex flex-wrap gap-2">
                            {REASONS.map((r) => (
                              <button
                                key={r}
                                onClick={() => report(c, r)}
                                className="rounded-full border border-slate-300/70 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {page < pages && (
          <div className="mt-6 text-center">
            <button
              onClick={() => loadComments(page + 1)}
              className="rounded-full border border-slate-300/70 bg-white/80 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Show more comments
            </button>
          </div>
        )}
      </div>
    </section>
  );
}