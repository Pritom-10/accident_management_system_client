'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BadgeCheck, Check, Copy } from 'lucide-react';
import { methodMeta } from '../../lib/money';

export function MethodChip({ id }) {
  const meta = methodMeta(id);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700">
      <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <BadgeCheck size={13} /> Verified
    </span>
  );
}

export function Pill({ info }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${info.cls}`}>{info.text}</span>;
}

export function ProgressBar({ value }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200/80">
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'linear-gradient(90deg, #34D399, #059669)' }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </div>
  );
}

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

export function ProgressRing({ value, size = 128 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={RING_R} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={RING_R}
          fill="none"
          stroke="#059669"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          initial={{ strokeDashoffset: RING_C }}
          animate={{ strokeDashoffset: RING_C * (1 - value / 100) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mono text-2xl text-slate-900">{value}%</span>
        <span className="text-[10px] text-slate-500">funded</span>
      </div>
    </div>
  );
}

export function TakaCount({ value, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = `৳${Math.round(v).toLocaleString('en-IN')}`;
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span ref={ref} className={className}>৳0</span>;
}

export function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      toast.error('Could not copy. Please copy it by hand.');
    }
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={copy}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={done ? 'done' : 'copy'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="flex items-center gap-1.5"
        >
          {done ? <Check size={13} /> : <Copy size={13} />}
          {done ? 'Copied' : label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

const pieces = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  x: (i * 37) % 100,
  color: ['#F43F5E', '#6366F1', '#10B981', '#F59E0B', '#0EA5E9'][i % 5],
  delay: (i % 7) * 0.06,
  rot: (i * 53) % 360,
  size: 6 + (i % 4) * 2,
}));

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: -12, width: p.size, height: p.size * 1.6, background: p.color }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 440, opacity: [1, 1, 0], rotate: p.rot + 360 }}
          transition={{ duration: 1.8, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}