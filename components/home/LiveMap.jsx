'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, MapPinned } from 'lucide-react';
import MapView from '../map/MapView';

export default function LiveMap({ pins = [] }) {
  const markers = pins
    .filter((p) => typeof p.location?.lat === 'number' && typeof p.location?.lng === 'number')
    .map((p) => ({
      id: p.caseId,
      lat: p.location.lat,
      lng: p.location.lng,
      status: p.status,
      title: p.accidentType,
      subtitle: [p.location.area, p.location.district].filter(Boolean).join(', '),
      href: `/accidents/${p.caseId}`,
    }));

  const live = markers.filter((m) => m.status === 'rescue_in_progress').length;

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.4fr]">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <MapPinned size={22} />
          </span>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">See where it happens.</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Every verified case with a location is a pin. Tap a pin to read the case. Open the full map to see blackspots, where accidents keep happening.
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-600" /> Rescue in progress</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-600" /> Cleared</span>
          </div>

          <p className="mono mt-5 text-sm text-slate-700">
            {markers.length} {markers.length === 1 ? 'pin' : 'pins'} · {live} under response
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/map"
              className="group flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              <AlertTriangle size={16} /> Open blackspot map
            </Link>
            <Link
              href="/accidents"
              className="group flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-white"
            >
              All cases <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] border border-white/70 bg-white/50 p-2 shadow-xl shadow-slate-900/5 backdrop-blur-xl"
        >
          <MapView markers={markers} height={430} emptyText="No cases with a map location yet." />
        </motion.div>
      </div>
    </section>
  );
}