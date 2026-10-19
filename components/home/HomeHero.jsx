'use client';

import { Fragment, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Droplet, HeartPulse, MapPin, Phone, ShieldCheck, Siren, Zap } from 'lucide-react';
import LocationSearch from '../LocationSearch';
import SubscribeBox from '../SubscribeBox';
import Magnetic from './Magnetic';
import { GroupBadge, TimeLeft } from '../blood/ui';

const words = [
  { t: 'When' },
  { t: 'every' },
  { t: 'minute' },
  { t: 'counts,' },
  { t: 'help' },
  { t: 'is' },
  { t: 'one', c: 'text-rose-600' },
  { t: 'tap', c: 'text-violet-600' },
  { t: 'away.', c: 'text-indigo-600' },
];

const trust = [
  [ShieldCheck, 'Every report is checked by an admin'],
  [Zap, 'No account needed to report'],
  [HeartPulse, 'Free for everyone'],
];

function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />
      <motion.div
        className="absolute -left-24 top-8 h-[26rem] w-[26rem] rounded-full bg-rose-400/30 blur-3xl"
        animate={{ x: [0, 70, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 top-0 h-[28rem] w-[28rem] rounded-full bg-indigo-400/30 blur-3xl"
        animate={{ x: [0, -60, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-300/25 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function HomeHero({ liveCount = 0, blood = null, accident = null }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yUp = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const yDown = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const place = accident ? [accident.location?.area, accident.location?.district].filter(Boolean).join(', ') : '';

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <Aurora />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/accidents?status=rescue_in_progress"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-xl"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
              </span>
              {liveCount > 0
                ? `${liveCount} ${liveCount === 1 ? 'case' : 'cases'} under response right now`
                : 'Live updates from every district'}
            </Link>
          </motion.div>

          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight text-slate-900 md:text-6xl lg:text-7xl">
            {words.map((w, i) => (
              <Fragment key={i}>
                <span className="inline-block overflow-hidden pb-1.5 align-bottom">
                  <motion.span
                    className={`inline-block ${w.c || ''}`}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w.t}
                  </motion.span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600"
          >
            Report an accident, find blood, or help a family pay for treatment. Everything is checked by admins and shown in the open.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <span className="relative inline-flex">
                <span className="absolute inset-0 animate-ping rounded-full bg-rose-500/35" />
                <Link
                  href="/report"
                  className="relative flex items-center gap-2.5 rounded-full bg-rose-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-rose-600/30 transition-colors hover:bg-rose-700"
                >
                  <Siren size={20} /> Report an emergency
                </Link>
              </span>
            </Magnetic>
            <Magnetic>
              <Link
                href="/blood"
                className="flex items-center gap-2.5 rounded-full border border-white/80 bg-white/80 px-6 py-4 text-base font-medium text-slate-800 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-colors hover:bg-white"
              >
                <Droplet size={20} className="text-rose-600" fill="currentColor" /> Find blood
              </Link>
            </Magnetic>
            <a
              href="tel:999"
              className="flex items-center gap-2 rounded-full px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              <Phone size={16} /> Call 999
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600"
          >
            {trust.map(([Icon, text]) => (
              <li key={text} className="flex items-center gap-2">
                <Icon size={16} className="text-emerald-600" /> {text}
              </li>
            ))}
          </motion.ul>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }}>
            <SubscribeBox />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <LocationSearch />

          {accident && (
            <motion.div style={{ y: yUp }} className="absolute -right-3 -top-12 hidden w-56 lg:block xl:-right-10">
              <motion.div
                style={{ rotate: 3 }}
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Link
                  href={`/accidents/${accident.caseId}`}
                  className="block rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
                >
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
                    </span>
                    Rescue in progress
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{accident.accidentType}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-600">
                    <MapPin size={11} /> {place}
                  </p>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {blood && (
            <motion.div style={{ y: yDown }} className="absolute -bottom-10 -left-4 hidden w-56 lg:block xl:-left-12">
              <motion.div
                style={{ rotate: -3 }}
                animate={{ y: [0, 9, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Link
                  href={`/blood/requests/${blood._id}`}
                  className="block rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3">
                    <GroupBadge group={blood.bloodGroup} size="md" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {blood.unitsNeeded} {blood.unitsNeeded === 1 ? 'bag' : 'bags'} needed
                      </p>
                      <p className="text-[11px] text-slate-600">{blood.location?.district}</p>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <TimeLeft neededBy={blood.neededBy} />
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}