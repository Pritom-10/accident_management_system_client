'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { fieldClass, labelClass, glass } from './styles';
export { fieldClass, labelClass, glass };

const tones = {
  rose: { bg: 'linear-gradient(135deg, rgba(244,63,94,0.16), rgba(129,140,248,0.14))', icon: 'bg-rose-600 shadow-rose-600/30', blob: 'bg-rose-400/40' },
  indigo: { bg: 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(244,114,182,0.12))', icon: 'bg-indigo-600 shadow-indigo-600/30', blob: 'bg-indigo-400/40' },
  emerald: { bg: 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(129,140,248,0.14))', icon: 'bg-emerald-600 shadow-emerald-600/30', blob: 'bg-emerald-400/40' },
  violet: { bg: 'linear-gradient(135deg, rgba(139,92,246,0.17), rgba(56,189,248,0.13))', icon: 'bg-violet-600 shadow-violet-600/30', blob: 'bg-violet-400/40' },
  sky: { bg: 'linear-gradient(135deg, rgba(14,165,233,0.16), rgba(16,185,129,0.12))', icon: 'bg-sky-600 shadow-sky-600/30', blob: 'bg-sky-400/40' },
  amber: { bg: 'linear-gradient(135deg, rgba(245,158,11,0.16), rgba(244,63,94,0.12))', icon: 'bg-amber-500 shadow-amber-500/30', blob: 'bg-amber-400/40' },
};

export function PageHero({ icon, tone = 'indigo', eyebrow, title, subtitle, actions, aside }) {
  const t = tones[tone] || tones.indigo;

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[2rem] border border-white/60 p-7 shadow-xl shadow-slate-900/5 md:p-10"
      style={{ background: t.bg }}
    >
      <motion.span
        className={`pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full blur-3xl ${t.blob}`}
        animate={{ x: [0, -30, 0], y: [0, 24, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]" />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <motion.span
            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${t.icon}`}
          >
            {icon}
          </motion.span>
          {eyebrow && <p className="mt-4 text-xs font-medium uppercase tracking-widest text-slate-500">{eyebrow}</p>}
          <h1 className={`${eyebrow ? 'mt-1.5' : 'mt-4'} text-3xl font-semibold leading-tight text-slate-900 md:text-4xl`}>{title}</h1>
          {subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">{subtitle}</p>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {aside}
      </div>
    </motion.section>
  );
}

export function SectionCard({ step, title, hint, delay = 0, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay }}
      className={`${glass} p-6 md:p-7`}
    >
      <div className="flex items-start gap-4">
        {step && (
          <span className="mono flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {step}
          </span>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-slate-600">{hint}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </motion.section>
  );
}

export function Switch({ checked, onChange, disabled, label, tone = 'emerald' }) {
  const on = tone === 'rose' ? 'bg-rose-500' : tone === 'violet' ? 'bg-violet-500' : 'bg-emerald-500';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${checked ? on : 'bg-slate-300'}`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`block h-6 w-6 rounded-full bg-white shadow ${checked ? 'ml-auto' : ''}`}
      />
    </button>
  );
}

const buttonTones = {
  indigo: 'bg-indigo-600 shadow-indigo-600/25 hover:bg-indigo-700',
  rose: 'bg-rose-600 shadow-rose-600/25 hover:bg-rose-700',
  emerald: 'bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-700',
  slate: 'bg-slate-900 shadow-slate-900/25 hover:bg-slate-800',
};

export function SubmitButton({ loading, icon, children, tone = 'indigo', className = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-medium text-white shadow-lg disabled:opacity-60 ${buttonTones[tone]} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}

export function PasswordField({ value, onChange, id, placeholder, minLength, autoComplete, required = true }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        required={required}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={minLength}
        autoComplete={autoComplete}
        className={`${fieldClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-500 hover:bg-slate-100"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}