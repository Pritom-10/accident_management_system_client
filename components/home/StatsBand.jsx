'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CountUp } from '../blood/ui';
import { TakaCount } from '../donate/ui';

export default function StatsBand({ stats }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const items = [
    { label: 'Cases solved', value: stats.solved, color: 'text-emerald-600' },
    { label: 'Open blood requests', value: stats.bloodOpen, color: 'text-rose-600' },
    { label: 'Donors ready to give', value: stats.donors, color: 'text-indigo-600' },
    { label: 'Raised for treatment', value: stats.raised, color: 'text-slate-900', taka: true },
  ];

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/60 bg-slate-200/60 shadow-md shadow-slate-900/5 lg:grid-cols-4"
      >
        {items.map((it) => (
          <div key={it.label} className="bg-white/75 p-6 backdrop-blur-xl md:p-8">
            <p className={`mono text-3xl font-semibold md:text-4xl ${it.color}`}>
              {inView ? it.taka ? <TakaCount value={it.value} /> : <CountUp value={it.value} /> : it.taka ? '৳0' : '0'}
            </p>
            <p className="mt-2 text-sm text-slate-600">{it.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}