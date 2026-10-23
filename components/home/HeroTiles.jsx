'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2, Droplet, HeartHandshake, MapPinned, Newspaper, Siren, UserSearch } from 'lucide-react';

function buildTiles(c) {
  return [
    {
      href: '/report',
      title: 'Report an accident',
      desc: 'Tell us what happened in under a minute. No account needed.',
      icon: Siren,
      wide: true,
      cls: 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white',
      sub: 'text-rose-100',
      iconBg: 'bg-white/20 text-white',
      spot: 'rgba(255,255,255,0.35)',
      badge: c.live > 0 ? `${c.live} under response` : null,
      badgeCls: 'bg-white/20 text-white',
      rings: true,
    },
    {
      href: '/blood',
      title: 'Blood needed',
      desc: 'See who needs blood, or ask for it.',
      icon: Droplet,
      cls: 'bg-white/70 text-slate-900',
      sub: 'text-slate-600',
      iconBg: 'bg-rose-100 text-rose-600',
      spot: 'rgba(244,63,94,0.16)',
      badge: c.bloodOpen > 0 ? `${c.bloodOpen} open` : null,
      badgeCls: 'bg-rose-100 text-rose-700',
    },
    {
      href: '/donate',
      title: 'Treatment bills',
      desc: 'Help a family. Every taka is tracked.',
      icon: HeartHandshake,
      cls: 'bg-white/70 text-slate-900',
      sub: 'text-slate-600',
      iconBg: 'bg-emerald-100 text-emerald-600',
      spot: 'rgba(16,185,129,0.16)',
      badge: c.campaigns > 0 ? `${c.campaigns} live` : null,
      badgeCls: 'bg-emerald-100 text-emerald-700',
    },
    {
      href: '/map',
      title: 'Accident map',
      desc: 'Pins, blackspots and heatmap.',
      icon: MapPinned,
      cls: 'bg-white/70 text-slate-900',
      sub: 'text-slate-600',
      iconBg: 'bg-violet-100 text-violet-600',
      spot: 'rgba(139,92,246,0.16)',
      badge: c.pins > 0 ? `${c.pins} ${c.pins === 1 ? 'pin' : 'pins'}` : null,
      badgeCls: 'bg-violet-100 text-violet-700',
    },
    {
      href: '/hospitals',
      title: 'Hospitals',
      desc: 'Numbers to call, and admitted patients.',
      icon: Building2,
      cls: 'bg-white/70 text-slate-900',
      sub: 'text-slate-600',
      iconBg: 'bg-sky-100 text-sky-600',
      spot: 'rgba(14,165,233,0.16)',
      badge: c.hospitals > 0 ? `${c.hospitals} listed` : null,
      badgeCls: 'bg-sky-100 text-sky-700',
    },
    {
      href: '/news',
      title: 'Accident news',
      desc: 'Verified stories, searchable by place.',
      icon: Newspaper,
      cls: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white',
      sub: 'text-slate-300',
      iconBg: 'bg-white/15 text-white',
      spot: 'rgba(255,255,255,0.18)',
    },
    {
      href: '/unidentified-patients',
      title: 'Unidentified patients',
      desc: 'Help a family find their own.',
      icon: UserSearch,
      cls: 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white',
      sub: 'text-indigo-100',
      iconBg: 'bg-white/20 text-white',
      spot: 'rgba(255,255,255,0.3)',
    },
  ];
}

function Tile({ tile, index }) {
  const Icon = tile.icon;

  function track(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={tile.wide ? 'col-span-2' : ''}
    >
      <Link
        href={tile.href}
        onMouseMove={track}
        style={{ '--spot': tile.spot }}
        className={`spotlight group flex h-full flex-col justify-between gap-3 overflow-hidden rounded-2xl border border-white/60 p-4 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
          tile.wide ? 'min-h-[10.5rem] md:p-5' : 'min-h-[8.5rem]'
        } ${tile.cls}`}
      >
        {tile.rings && (
          <>
            <motion.span
              className="pointer-events-none absolute -bottom-14 -right-14 h-44 w-44 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="pointer-events-none absolute -bottom-14 -right-14 h-44 w-44 rounded-full border-2 border-white/30"
              animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 1.3 }}
            />
          </>
        )}

        <div className="relative flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${tile.iconBg}`}>
            <Icon size={20} />
          </span>
          <ArrowUpRight
            size={18}
            className="opacity-50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </div>

        <div className="relative">
          <h3 className={`font-semibold leading-tight ${tile.wide ? 'text-xl md:text-2xl' : 'text-base'}`}>{tile.title}</h3>
          <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${tile.sub} ${tile.wide ? 'max-w-xs text-sm' : ''}`}>{tile.desc}</p>
          {tile.badge && (
            <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${tile.badgeCls}`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
              </span>
              {tile.badge}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export default function HeroTiles({ counts = {} }) {
  const tiles = buildTiles(counts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col rounded-[2rem] border border-white/70 bg-white/50 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl md:p-5"
    >
      <div className="px-1 pb-4 pt-1">
        <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">What do you need right now?</h2>
        <p className="mt-1 text-sm text-slate-600">Pick one. Everything here works on a phone.</p>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3" style={{ gridTemplateRows: '1.35fr repeat(3, 1fr)' }}>
        {tiles.map((t, i) => (
          <Tile key={t.href} tile={t} index={i} />
        ))}
      </div>
    </motion.div>
  );
}