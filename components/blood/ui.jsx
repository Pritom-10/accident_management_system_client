'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { Clock, Droplet } from 'lucide-react';
import { BLOOD_GROUPS, timeLeft, tierStyle } from '../../lib/blood';

const gradient = { background: 'linear-gradient(135deg, #F43F5E, #BE123C)' };

export function GroupBadge({ group, size = 'md' }) {
  const sizes = {
    sm: 'h-8 min-w-8 gap-1 px-2.5 text-xs',
    md: 'h-11 min-w-11 gap-1 px-3 text-sm',
    lg: 'h-16 min-w-16 gap-1.5 px-4 text-xl',
  };
  return (
    <span
      style={gradient}
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl font-semibold text-white shadow-md shadow-rose-600/30 ${sizes[size]}`}
    >
      <Droplet size={size === 'lg' ? 18 : 13} fill="currentColor" />
      {group}
    </span>
  );
}

const statusMeta = {
  pending: { text: 'Waiting for donors', cls: 'bg-amber-100 text-amber-700' },
  accepted: { text: 'Donor found', cls: 'bg-sky-100 text-sky-700' },
  completed: { text: 'Completed', cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { text: 'Cancelled', cls: 'bg-slate-200 text-slate-600' },
};

export function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta.pending;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.cls}`}>{meta.text}</span>;
}

export function TimeLeft({ neededBy, className = '' }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const { text, tier } = timeLeft(neededBy, now);

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tierStyle[tier].cls} ${className}`}>
      {tier === 'critical' && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
        </span>
      )}
      <Clock size={12} />
      <span suppressHydrationWarning>{text}</span>
    </span>
  );
}

export function CountUp({ value, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={ref} className={className}>0</span>;
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-white/60 ${className}`} />;
}

export function GroupPicker({ value, onChange, allowAll = false, id = 'gp' }) {
  const options = allowAll ? ['', ...BLOOD_GROUPS] : BLOOD_GROUPS;

  return (
    <div className={`grid gap-2 ${allowAll ? 'grid-cols-5 sm:grid-cols-9' : 'grid-cols-4 sm:grid-cols-8'}`}>
      {options.map((g) => {
        const active = value === g;
        return (
          <motion.button
            key={g || 'all'}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(g)}
            className="relative h-11 rounded-xl border border-slate-200 bg-white/70 text-sm font-semibold"
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-xl bg-rose-600 shadow-md shadow-rose-600/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative ${active ? 'text-white' : 'text-slate-700'}`}>{g || 'All'}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-white/50 bg-white/40 p-10 text-center backdrop-blur-xl"
    >
      <motion.span
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-rose-500"
      >
        <Icon size={26} />
      </motion.span>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {text && <p className="max-w-sm text-sm text-slate-600">{text}</p>}
      {children}
    </motion.div>
  );
}