'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Siren, Search, Activity, Users, MapPin } from 'lucide-react';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: 'easeOut' },
});

export default function Hero({ stats }) {
  const items = [
    { icon: Activity, value: stats.casesUnderResponse, label: 'Cases under response', color: 'text-rose-600' },
    { icon: Users, value: stats.availableVolunteers ?? '—', label: 'Available volunteers', color: 'text-indigo-600' },
    { icon: MapPin, value: stats.districtsCovered, label: 'Districts covered', color: 'text-emerald-600' },
  ];

  return (
    <section className="border-b border-white/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
        <div>
          <motion.p {...fade(0)} className="mono flex items-center gap-2 text-xs uppercase tracking-widest text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
            </span>
            live updates, every district
          </motion.p>

          <motion.h1 {...fade(0.08)} className="mt-4 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Know what&rsquo;s happening near you, before it&rsquo;s too late.
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
            Verified accident reports, hospital contacts and missing person alerts for every
            division, district and area — updated the moment our administrators confirm them.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/report"
              className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700"
            >
              <Siren size={18} /> Report an emergency
            </Link>
            <Link
              href="/missing-persons"
              className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/60 px-5 py-3 text-sm font-medium text-slate-700 backdrop-blur hover:bg-white/90"
            >
              <Search size={18} /> Search missing persons
            </Link>
          </motion.div>

          <motion.div {...fade(0.32)} className="mt-12 grid grid-cols-3 gap-6 rounded-2xl border border-white/50 bg-white/40 p-6 backdrop-blur-xl">
            {items.map(({ icon: Icon, value, label, color }) => (
              <div key={label}>
                <Icon size={18} className={color} />
                <p className="mono mt-2 text-2xl text-slate-900">{value}</p>
                <p className="mt-1 text-xs leading-snug text-slate-600">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div {...fade(0.2)} className="h-fit rounded-2xl border border-white/50 bg-white/50 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-900">Find accidents near you</p>
          <p className="mt-1 text-xs text-slate-600">Narrow by division, district and area.</p>

          <div className="mt-5 space-y-3">
            <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700">
              <option>Division</option>
              <option>Chattogram</option>
              <option>Dhaka</option>
              <option>Khulna</option>
            </select>
            <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700">
              <option>District</option>
            </select>
            <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700">
              <option>Area</option>
            </select>
            <Link href="/accidents" className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
              <Search size={16} /> Search
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
