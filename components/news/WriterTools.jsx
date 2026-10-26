'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Plus, Send, Trash2 } from 'lucide-react';
import { API_BASE, apiFetch } from '../../lib/api';
import { UPDATE_KINDS, kindMeta } from '../../lib/newsExtras';
import { dateText } from '../../lib/blood';
import { useAuth } from '../AuthProvider';
import { fieldClass, glass, labelClass } from '../ui/styles';

const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export default function WriterTools({ newsId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState('injured');
  const [text, setText] = useState('');
  const [at, setAt] = useState(today());
  const [changeCounts, setChangeCounts] = useState(false);
  const [deaths, setDeaths] = useState('0');
  const [injured, setInjured] = useState('0');

  const isWriter = Boolean(user && user.roles.some((r) => r === 'admin' || r === 'journalist'));
  const isAdmin = Boolean(user && user.roles.includes('admin'));

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE}/news/${newsId}/manage`);
      if (!res.ok) throw new Error('no access');
      const data = await res.json();
      setPost(data);
      setDeaths(String(data.deaths || 0));
      setInjured(String(data.injured || 0));
    } catch {
      setPost(null);
    }
  }, [newsId]);

  useEffect(() => {
    if (!isWriter) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPost(null);
      return;
    }
    load();
  }, [isWriter, load, user?._id]);

  if (!post || post.status !== 'published') return null;

  const waiting = (post.updates || []).filter((u) => !u.approved);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { kind, text, at: new Date(`${at}T12:00:00`).toISOString() };
      if (changeCounts) {
        payload.deaths = Number(deaths);
        payload.injured = Number(injured);
      }

      const res = await apiFetch(`${API_BASE}/news/${newsId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not add the update');

      toast.success(data.approved ? 'Update published' : 'Update sent. An admin will check it first.');
      setText('');
      setOpen(false);
      setChangeCounts(false);
      await load();
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeUpdate(u) {
    try {
      const res = await apiFetch(`${API_BASE}/news/${newsId}/updates/${u._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not remove the update');
      toast.success('Update removed');
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <section className={`${glass} mt-6 border-l-4 border-l-indigo-500 p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Writer tools</h2>
          <p className="text-xs text-slate-500">Only you and the admins see this box.</p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
        >
          <Plus size={16} /> Add an update
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            onSubmit={submit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-4 rounded-2xl bg-white/70 p-4">
              <div className="flex flex-wrap gap-2">
                {UPDATE_KINDS.map((k) => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setKind(k.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium ${kind === k.value ? 'bg-slate-900 text-white' : 'border border-slate-300/70 bg-white text-slate-700'}`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>

              <div>
                <label htmlFor="upd-text" className={labelClass}>What is new?</label>
                <textarea
                  id="upd-text"
                  required
                  rows={4}
                  maxLength={1500}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="For example: The two injured people are now stable."
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="upd-at" className={labelClass}>Date</label>
                  <input id="upd-at" required type="date" value={at} max={today()} onChange={(e) => setAt(e.target.value)} className={fieldClass} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={changeCounts} onChange={(e) => setChangeCounts(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                The number of dead or injured has changed
              </label>

              {changeCounts && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Dead now</label>
                    <input type="number" min="0" value={deaths} onChange={(e) => setDeaths(e.target.value)} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Injured now</label>
                    <input type="number" min="0" value={injured} onChange={(e) => setInjured(e.target.value)} className={fieldClass} />
                  </div>
                </div>
              )}

              {!isAdmin && (
                <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">An admin will read your update before it appears on the story.</p>
              )}

              <button
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isAdmin ? 'Publish the update' : 'Send for review'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {waiting.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium text-slate-600">Waiting for review</p>
          <ul className="mt-2 space-y-2">
            {waiting.map((u) => (
              <li key={u._id} className="flex items-start justify-between gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                <span>
                  <span className="text-xs font-semibold">{kindMeta(u.kind).label} · {dateText(u.at)}</span>
                  <span className="mt-0.5 block">{u.text}</span>
                </span>
                <button onClick={() => removeUpdate(u)} aria-label="Remove this update" className="shrink-0 rounded-full p-2 text-amber-700 hover:bg-amber-100">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}