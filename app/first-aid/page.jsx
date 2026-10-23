'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, HeartPulse, Info, Phone, Siren, X } from 'lucide-react';
import { topics } from '../../lib/firstAid';
import CprMetronome from '../../components/firstaid/CprMetronome';

function Topic({ topic }) {
  const Icon = topic.icon;

  return (
    <motion.section
      id={topic.id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-40 rounded-3xl border border-white/60 bg-white/60 p-6 shadow-md shadow-slate-900/5 backdrop-blur-xl md:p-8"
    >
      <div className="flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${topic.tone}`}>
          <Icon size={26} />
        </span>
        <h2 className="text-2xl font-semibold leading-tight text-slate-900">{topic.title}</h2>
      </div>

      <p className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-medium leading-relaxed text-rose-800">
        <Phone size={18} className="mt-0.5 shrink-0" /> {topic.call}
      </p>

      <ol className="mt-6 space-y-4">
        {topic.steps.map((step, i) => (
          <motion.li
            key={step}
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: Math.min(i, 4) * 0.05 }}
            className="flex gap-4"
          >
            <span className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {i + 1}
            </span>
            <p className="pt-1.5 text-base leading-relaxed text-slate-800">{step}</p>
          </motion.li>
        ))}
      </ol>

      {topic.id === 'cpr' && <CprMetronome />}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="mb-2 text-sm font-semibold text-emerald-800">Do</p>
          <ul className="space-y-2">
            {topic.dos.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-emerald-900">
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4">
          <p className="mb-2 text-sm font-semibold text-rose-800">Do not</p>
          <ul className="space-y-2">
            {topic.donts.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-rose-900">
                <X size={16} className="mt-0.5 shrink-0 text-rose-600" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {topic.note && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <Info size={16} className="mt-0.5 shrink-0" /> {topic.note}
        </p>
      )}
    </motion.section>
  );
}

export default function FirstAidPage() {
  const [current, setCurrent] = useState(topics[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.5] }
    );

    topics.forEach((t) => {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    });

    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
    }

    return () => observer.disconnect();
  }, []);

  function jump(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
          <HeartPulse size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">First aid guide</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          Simple steps for the first minutes after an accident, until trained help arrives. Read it now, so you know what to do later.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a href="tel:999" className="flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700">
            <Phone size={16} /> Call 999 first
          </a>
          <Link href="/sos" className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-white">
            <Siren size={16} /> Send an SOS
          </Link>
        </div>
      </motion.div>

      <div className="sticky top-20 z-30 -mx-6 mt-8 overflow-x-auto px-6 py-3 no-scrollbar">
        <div className="flex w-max gap-2 rounded-full border border-white/70 bg-white/80 p-1.5 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          {topics.map((t) => (
            <button key={t.id} onClick={() => jump(t.id)} className="relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium">
              {current === t.id && (
                <motion.span
                  layoutId="aid-pill"
                  className="absolute inset-0 rounded-full bg-slate-900"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className={`relative ${current === t.id ? 'text-white' : 'text-slate-700'}`}>{t.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {topics.map((t) => (
          <Topic key={t.id} topic={t} />
        ))}
      </div>

      <p className="mt-10 rounded-2xl bg-slate-100 p-5 text-xs leading-relaxed text-slate-600">
        This guide gives basic help until trained responders arrive. It does not replace a first aid course or a doctor&rsquo;s advice. If you can, learn first aid from a trained teacher, such as the Bangladesh Red Crescent Society.
      </p>
    </main>
  );
}