'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClipboardList, Droplet, HeartPulse, Plus, Search, X } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import BloodRequestCard from '../../components/blood/BloodRequestCard';
import { CountUp, EmptyState, GroupPicker, Skeleton } from '../../components/blood/ui';
import LocationFields, { toLocationQuery } from '../../components/LocationFields';

const PAGE_SIZE = 9;
const emptyLoc = { division: '', district: '', areaKey: '' };

const drops = [
  { left: '72%', top: '14%', size: 54, delay: 0 },
  { left: '86%', top: '46%', size: 34, delay: 0.8 },
  { left: '64%', top: '62%', size: 26, delay: 1.6 },
];

export default function BloodPage() {
  const [group, setGroup] = useState('');
  const [loc, setLoc] = useState(emptyLoc);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const query = useMemo(() => ({ ...(group ? { group } : {}), ...toLocationQuery(loc) }), [group, loc]);
  const anyFilter = Boolean(group || loc.division || loc.district || loc.areaKey);

  useEffect(() => {
    fetch(`${API_BASE}/blood/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ ...query, page: String(page), limit: String(PAGE_SIZE) });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setFailed(false);

    fetch(`${API_BASE}/blood/requests?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((json) => {
        setItems((prev) => (page === 1 ? json.items : [...prev, ...json.items]));
        setMeta({ total: json.total, pages: json.pages });
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setFailed(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query, page]);

  function changeGroup(g) {
    setGroup(g);
    setPage(1);
  }

  function changeLoc(v) {
    setLoc(v);
    setPage(1);
  }

  function clearAll() {
    setGroup('');
    setLoc(emptyLoc);
    setPage(1);
  }

  const statCards = [
    { label: 'Open requests', value: stats?.openRequests },
    { label: 'Donors ready to give', value: stats?.donors },
    { label: 'Donations confirmed', value: stats?.donations },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-3xl border border-white/50 p-8 shadow-xl shadow-slate-900/5 md:p-12"
        style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.14), rgba(129,140,248,0.14))' }}
      >
        {drops.map((d, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute text-rose-500/30"
            style={{ left: d.left, top: d.top }}
            animate={{ y: [0, -16, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
          >
            <Droplet size={d.size} fill="currentColor" />
          </motion.span>
        ))}

        <div className="relative max-w-xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
            <HeartPulse size={24} />
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            One bag of blood can save a life.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Find who needs blood near you, or join as a donor and get told when your blood group is needed.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href="/blood/request" className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700">
                <Plus size={18} /> I need blood
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href="/blood/donor" className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
                <Droplet size={18} /> Become a donor
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href="/blood/donors" className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white">
                <Search size={18} /> Find donors
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link href="/blood/mine" className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white">
                <ClipboardList size={18} /> My blood activity
              </Link>
            </motion.div>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-3 md:max-w-xl">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/60 bg-white/60 p-4 backdrop-blur-xl">
              {s.value === undefined ? (
                <Skeleton className="h-8 w-14" />
              ) : (
                <p className="mono text-2xl text-slate-900"><CountUp value={s.value} /></p>
              )}
              <p className="mt-1 text-xs leading-snug text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <section className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">Who is needed?</p>
          {anyFilter && (
            <button onClick={clearAll} className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <GroupPicker value={group} onChange={changeGroup} allowAll id="list" />
        <LocationFields value={loc} onChange={changeLoc} idPrefix="req" />
      </section>

      <p className="mt-6 text-sm text-slate-600">
        {meta.total} {meta.total === 1 ? 'request' : 'requests'} open{anyFilter ? ' for this search' : ''}
      </p>

      <div className="mt-4">
        {failed ? (
          <EmptyState icon={Droplet} title="Could not load the requests" text="Please check your connection and try again." />
        ) : loading && items.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={HeartPulse}
            title={anyFilter ? 'No request matches this search' : 'No one needs blood right now'}
            text={anyFilter ? 'Try fewer filters.' : 'That is good news. You can still join as a donor, so you are ready next time.'}
          >
            <Link href="/blood/donor" className="mt-1 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
              Become a donor
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((r, i) => (
              <BloodRequestCard key={r._id} request={r} index={i % PAGE_SIZE} />
            ))}
          </div>
        )}
      </div>

      {page < meta.pages && !failed && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setPage(page + 1)}
            disabled={loading}
            className="rounded-full border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Show more'}
          </button>
        </div>
      )}
    </main>
  );
}