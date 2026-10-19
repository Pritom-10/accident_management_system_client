'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, Droplet, HeartHandshake, MapPinned, Newspaper, Siren, UserSearch } from 'lucide-react';

const tiles = [
  {
    href: '/report',
    title: 'Report an emergency',
    desc: 'Tell us what happened in under a minute. No account needed. Admins check it, then it shows on the map.',
    icon: Siren,
    big: true,
    cls: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white',
    sub: 'text-rose-100',
    iconBg: 'bg-white/20 text-white',
    spot: 'rgba(255,255,255,0.35)',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    href: '/blood',
    title: 'Blood needed',
    desc: 'See who needs blood near you, or ask for it.',
    icon: Droplet,
    cls: 'bg-white/60 text-slate-900',
    sub: 'text-slate-600',
    iconBg: 'bg-rose-100 text-rose-600',
    spot: 'rgba(244,63,94,0.16)',
    span: '',
  },
  {
    href: '/donate',
    title: 'Treatment bills',
    desc: 'Help a family. Every taka is tracked.',
    icon: HeartHandshake,
    cls: 'bg-white/60 text-slate-900',
    sub: 'text-slate-600',
    iconBg: 'bg-emerald-100 text-emerald-600',
    spot: 'rgba(16,185,129,0.16)',
    span: '',
  },
  {
    href: '/map',
    title: 'Accident map',
    desc: 'Blackspots and heatmap.',
    icon: MapPinned,
    cls: 'bg-white/60 text-slate-900',
    sub: 'text-slate-600',
    iconBg: 'bg-violet-100 text-violet-600',
    spot: 'rgba(139,92,246,0.16)',
    span: '',
  },
  {
    href: '/hospitals',
    title: 'Hospitals',
    desc: 'Numbers to call, and admitted patients.',
    icon: Building2,
    cls: 'bg-white/60 text-slate-900',
    sub: 'text-slate-600',
    iconBg: 'bg-sky-100 text-sky-600',
    spot: 'rgba(14,165,233,0.16)',
    span: '',
  },
  {
    href: '/news',
    title: 'Accident news',
    desc: 'Verified stories from admins and journalists, searchable by place and vehicle.',
    icon: Newspaper,
    cls: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white',
    sub: 'text-slate-300',
    iconBg: 'bg-white/15 text-white',
    spot: 'rgba(255,255,255,0.18)',
    span: 'md:col-span-2',
  },
  {
    href: '/unidentified-patients',
    title: 'Unidentified patients',
    desc: 'Someone in hospital may be waiting for their family. Help identify them.',
    icon: UserSearch,
    cls: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white',
    sub: 'text-indigo-100',
    iconBg: 'bg-white/20 text-white',
    spot: 'rgba(255,255,255,0.3)',
    span: 'md:col-span-2',
  },
];

function Tile({ tile, index }) {
  const Icon = tile.icon;

  function track(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`h-full ${tile.span}`}
    >
      <Link
        href={tile.href}
        onMouseMove={track}
        style={{ '--spot': tile.spot }}
        className={`spotlight group flex h-full min-h-[10rem] flex-col justify-between overflow-hidden rounded-3xl border border-white/60 p-6 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${tile.cls}`}
      >
        {tile.big && (
          <>
            <motion.span
              className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 1.3 }}
            />
          </>
        )}

        <div className="relative flex items-start justify-between">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${tile.iconBg}`}>
            <Icon size={24} />
          </span>
          <ArrowUpRight
            size={20}
            className="opacity-60 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:opacity-100"
          />
        </div>

        <div className="relative mt-6">
          <h3 className={`font-semibold ${tile.big ? 'text-2xl md:text-3xl' : 'text-lg'}`}>{tile.title}</h3>
          <p className={`mt-1.5 text-sm leading-relaxed ${tile.sub} ${tile.big ? 'max-w-sm' : ''}`}>{tile.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ActionGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-xl"
      >
        <h2 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">What do you need right now?</h2>
        <p className="mt-2 text-sm text-slate-600">Pick one. Everything here works on a phone.</p>
      </motion.div>

      <div className="mt-8 grid gap-4 md:auto-rows-[11rem] md:grid-cols-4">
        {tiles.map((t, i) => (
          <Tile key={t.href} tile={t} index={i} />
        ))}
      </div>
    </section>
  );
}