'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartPulse, Phone, ShieldCheck, Siren, Zap } from 'lucide-react';
import SubscribeBox from '../SubscribeBox';
import Magnetic from './Magnetic';
import HeroTiles from './HeroTiles';

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
  [Zap, 'No account needed in an emergency'],
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

export default function HomeHero({ liveCount = 0, counts = {} }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />

      <div className="mx-auto grid max-w-6xl gap-x-14 gap-y-10 px-6 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-28">
        <div className="lg:col-start-1 lg:row-start-1">
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
            Press SOS to tell nearby volunteers, report an accident, find blood, or help a family pay for treatment. Everything is checked by admins and shown in the open.
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
                  href="/sos"
                  className="relative flex items-center gap-2.5 rounded-full bg-rose-600 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-rose-600/30 transition-colors hover:bg-rose-700"
                >
                  <Siren size={20} /> SOS: get help now
                </Link>
              </span>
            </Magnetic>
            <Magnetic>
              <a
                href="tel:999"
                className="flex items-center gap-2.5 rounded-full border border-white/80 bg-white/80 px-6 py-4 text-base font-medium text-slate-800 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-colors hover:bg-white"
              >
                <Phone size={19} className="text-rose-600" /> Call 999
              </a>
            </Magnetic>
            <Link
              href="/first-aid"
              className="flex items-center gap-2 rounded-full px-4 py-4 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              <HeartPulse size={16} /> First aid guide
            </Link>
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
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroTiles counts={{ ...counts, live: liveCount }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="lg:col-start-1 lg:row-start-2"
        >
          <SubscribeBox />
        </motion.div>
      </div>
    </section>
  );
}