'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, MapPin, MessageCircle, Phone, Search, Users, X } from 'lucide-react';
import RoleGate from '../../../components/RoleGate';
import { GroupBadge, EmptyState, GroupPicker, Skeleton } from '../../../components/blood/ui';
import LocationFields, { toLocationQuery } from '../../../components/LocationFields';
import { API_BASE, apiFetch } from '../../../lib/api';
import { dateText, displayPhone, telLink, waLink } from '../../../lib/blood';
import { imageSrc } from '../../../lib/imageUrl';
import { Stars } from '../../../components/ui/Stars';

const PAGE_SIZE = 12;
const emptyLoc = { division: '', district: '', areaKey: '' };

function DonorCard({ donor, group, index }) {
  const place = [donor.area, donor.district].filter(Boolean).join(', ');
  const initials = donor.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const message = `Hello ${donor.name.split(' ')[0]}, I found you on ResQ. ${group ? `I need ${group} blood.` : 'I need blood.'} Can you help?`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -4 }}
      className="flex h-full flex-col gap-4 rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-shadow hover:shadow-xl"
    >
      <div className="flex items-center gap-4">
        {donor.photoUrl ? (
          <img src={imageSrc(donor.photoUrl)} alt="" className="h-14 w-14 shrink-0 rounded-full border border-white object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-100 text-lg font-semibold text-rose-600">
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900">{donor.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600"><MapPin size={12} /> {place || 'Area not given'}</p>
        </div>
        <GroupBadge group={donor.bloodGroup} />
      </div>

      <p className="text-xs text-slate-600">
        {donor.lastDonationDate ? `Last donated ${dateText(donor.lastDonationDate)}` : 'Has not donated yet'}
        {donor.donationCount > 0 ? ` · ${donor.donationCount} ${donor.donationCount === 1 ? 'donation' : 'donations'}` : ''}
      </p>
            {donor.rating && (
        <p className="flex items-center gap-1.5 text-xs text-slate-600">
          <Stars value={donor.rating.avg} /> {donor.rating.avg} ({donor.rating.count})
        </p>
      )}

      {donor.phone && (
        <div className="mt-auto flex flex-wrap gap-2">
          <a href={telLink(donor.phone)} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800">
            <Phone size={13} /> {displayPhone(donor.phone)}
          </a>
          <a
            href={waLink(donor.phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700"
          >
            <MessageCircle size={13} /> WhatsApp
          </a>
        </div>
      )}
    </motion.div>
  );
}

function Donors() {
  const [group, setGroup] = useState('');
  const [compatible, setCompatible] = useState(true);
  const [loc, setLoc] = useState(emptyLoc);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const query = useMemo(
    () => ({ ...(group ? { group, ...(compatible ? { compatible: '1' } : {}) } : {}), ...toLocationQuery(loc) }),
    [group, compatible, loc]
  );
  const anyFilter = Boolean(group || loc.division || loc.district || loc.areaKey);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ ...query, page: String(page), limit: String(PAGE_SIZE) });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setFailed(false);

    apiFetch(`${API_BASE}/blood/donors?${params.toString()}`, { signal: controller.signal })
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

  function reset() {
    setGroup('');
    setLoc(emptyLoc);
    setPage(1);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
          <Search size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Find blood donors</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Only donors who are available and fit to donate today are listed.
        </p>
      </motion.div>

      <section className="mt-8 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">Blood group needed</p>
          {anyFilter && (
            <button onClick={reset} className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white">
              <X size={12} /> Clear all
            </button>
          )}
        </div>
        <GroupPicker value={group} onChange={(g) => { setGroup(g); setPage(1); }} allowAll id="donors" />
        {group && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={compatible}
              onChange={(e) => { setCompatible(e.target.checked); setPage(1); }}
              className="h-4 w-4 accent-rose-600"
            />
            Also show other groups that can give to {group}
          </label>
        )}
        <LocationFields value={loc} onChange={(v) => { setLoc(v); setPage(1); }} idPrefix="don" />
      </section>

      <p className="mt-6 text-sm text-slate-600">
        {meta.total} {meta.total === 1 ? 'donor' : 'donors'} available{anyFilter ? ' for this search' : ''}
      </p>

      <div className="mt-4">
        {failed ? (
          <EmptyState icon={Droplet} title="Could not load the donors" text="Please try again in a moment." />
        ) : loading && items.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-44" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={Users} title="No donor found" text="Try other areas or turn on the option to show other compatible groups." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d, i) => <DonorCard key={d._id} donor={d} group={group} index={i % PAGE_SIZE} />)}
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

export default function DonorsPage() {
  return (
    <RoleGate roles={['user']} deniedText="Please log in to see the donors.">
      <Donors />
    </RoleGate>
  );
}