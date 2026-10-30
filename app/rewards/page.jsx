'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Lock, Medal, Trophy } from 'lucide-react';
import { PageHero, Switch } from '../../components/ui/kit';
import { glass } from '../../components/ui/styles';
import VerifiedMark from '../../components/ui/VerifiedMark';
import { Stars } from '../../components/ui/Stars';
import { CountUp, EmptyState, Skeleton } from '../../components/blood/ui';
import { useAuth } from '../../components/AuthProvider';
import { API_BASE, apiFetch } from '../../lib/api';
import { imageSrc } from '../../lib/imageUrl';
import { BADGES, RULES } from '../../lib/rewards';

const rankTone = ['bg-amber-400 text-white', 'bg-slate-300 text-slate-800', 'bg-orange-300 text-white'];

function BadgeIcon({ id, locked = false, size = 18 }) {
  const b = BADGES[id];
  if (!b) return null;
  const Icon = b.icon;
  return (
    <span title={`${b.label}: ${b.desc}`} className={`flex h-10 w-10 items-center justify-center rounded-xl ${locked ? 'bg-slate-100 text-slate-300' : b.tone}`}>
      <Icon size={size} />
    </span>
  );
}

function Mine({ me, onToggle }) {
  const nextOnes = me.progress.slice(0, 4);

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className={`${glass} mt-6 p-6 md:p-8`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Your points</p>
          <p className="mono text-5xl font-semibold text-slate-900"><CountUp value={me.points} /></p>
        </div>
        {me.rating.count > 0 && (
          <p className="flex items-center gap-2 text-sm text-slate-700">
            <Stars value={me.rating.avg} size={16} /> {me.rating.avg} from {me.rating.count} {me.rating.count === 1 ? 'person' : 'people'}
          </p>
        )}
      </div>

      <p className="mt-6 text-sm font-semibold text-slate-900">Your badges</p>
      {me.badges.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No badge yet. Give blood, answer an SOS or help a campaign to earn your first one.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-3">
          {me.badges.map((id) => (
            <div key={id} className="flex items-center gap-3 rounded-2xl bg-white/70 py-2 pl-2 pr-4">
              <BadgeIcon id={id} />
              <div>
                <p className="text-sm font-semibold text-slate-900">{BADGES[id].label}</p>
                <p className="text-[11px] text-slate-500">{BADGES[id].desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {nextOnes.length > 0 && (
        <>
          <p className="mt-6 text-sm font-semibold text-slate-900">Next badges</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {nextOnes.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
                <BadgeIcon id={p.id} locked />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{BADGES[p.id].label}</p>
                  <p className="text-[11px] text-slate-500">{BADGES[p.id].desc}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <motion.div className="h-full rounded-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${(p.have / p.need) * 100}%` }} transition={{ duration: 0.7 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200/70 pt-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">Show me on the leaderboard</p>
          <p className="text-xs text-slate-600">Shows your short name, photo, points and badges. Nothing else. Off by default.</p>
        </div>
        <Switch checked={me.showOnBoard} onChange={onToggle} label="Show me on the leaderboard" tone="violet" />
      </div>
    </motion.section>
  );
}

export default function RewardsPage() {
  const { user, loading } = useAuth();
  const [me, setMe] = useState(null);
  const [board, setBoard] = useState(null);

  const loadBoard = useCallback(() => {
    apiFetch(`${API_BASE}/rewards/board`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setBoard)
      .catch(() => setBoard([]));
  }, []);

  useEffect(() => {
    if (loading) return;
    loadBoard();
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMe(null);
      return;
    }
    apiFetch(`${API_BASE}/rewards/me`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, [loading, user, loadBoard]);

  async function toggle(value) {
    const previous = me;
    setMe({ ...me, showOnBoard: value });
    try {
      const res = await apiFetch(`${API_BASE}/rewards/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnBoard: value }),
      });
      if (!res.ok) throw new Error('Could not save');
      loadBoard();
    } catch (err) {
      setMe(previous);
      toast.error(err.message);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Trophy size={24} />}
        tone="amber"
        eyebrow="Thank you to everyone who helps"
        title="Points and badges"
        subtitle="Points have no money value. They are a way to say thank you to people who give blood, show up at an SOS and help families."
      />

      {user && me && <Mine me={me} onToggle={toggle} />}

      {!user && !loading && (
        <p className={`${glass} mt-6 flex items-center gap-3 p-5 text-sm text-slate-700`}>
          <Lock size={16} /> <span><Link href="/login" className="font-semibold text-indigo-600 hover:underline">Log in</Link> to see your own points and badges.</span>
        </p>
      )}

      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900"><Medal size={20} /> Leaderboard</h2>

        <div className="mt-4">
          {board === null ? (
            <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
          ) : board.length === 0 ? (
            <EmptyState icon={Trophy} title="No one is on the leaderboard yet" text="People appear here only if they turn it on. Be the first." />
          ) : (
            <ul className="space-y-3">
              {board.map((r, i) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i, 10) * 0.04 }}
                  className={`${glass} flex items-center gap-4 p-4 ${r.mine ? 'ring-2 ring-indigo-400' : ''}`}
                >
                  <span className={`mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${rankTone[i] || 'bg-slate-100 text-slate-600'}`}>{r.rank}</span>
                  {r.photoUrl ? (
                    <img src={imageSrc(r.photoUrl)} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">{r.name.charAt(0)}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
                      {r.name} {r.verified && <VerifiedMark size={14} />}
                      {r.mine && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700">You</span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.badges.map((b) => <BadgeIcon key={b} id={b} size={13} />)}
                    </div>
                  </div>
                  <p className="mono shrink-0 text-lg font-semibold text-slate-900">{r.points}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className={`${glass} mt-6 p-6`}>
        <h2 className="text-base font-semibold text-slate-900">How points work</h2>
        <ul className="mt-3 divide-y divide-slate-200/70">
          {RULES.map(([text, n]) => (
            <li key={text} className="flex items-center justify-between py-2.5 text-sm text-slate-700">
              <span>{text}</span><span className="mono font-semibold text-slate-900">+{n}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}