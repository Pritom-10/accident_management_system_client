'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Clock, Droplet, Phone } from 'lucide-react';
import { API_BASE } from '../../lib/api';
import { stockTone } from '../../lib/hospital';
import { timeAgo } from '../../lib/sos';

export default function NearbyStock({ group, district }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams({ group });
    if (district) params.set('district', district);

    fetch(`${API_BASE}/hospitals/blood-stock?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setRows)
      .catch(() => setRows([]));
  }, [group, district]);

  if (!rows || rows.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Droplet size={16} className="text-rose-600" fill="currentColor" /> {group} blood in stock{district ? ` in ${district}` : ''}
      </p>
      <p className="mt-1 text-xs text-slate-600">
        The hospital or blood bank may be able to give blood directly. Numbers can change fast, so call before you go.
      </p>

      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${stockTone(r.units)}`}>
                <span className="mono">{r.units}</span>
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                  <Building2 size={14} className="shrink-0" /> <span className="truncate">{r.name}</span>
                </p>
                <p className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock size={11} /> Updated {timeAgo(r.updatedAt)}
                </p>
              </div>
            </div>
            <a
              href={`tel:${r.phone}`}
              className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              <Phone size={13} /> {r.phone}
            </a>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}