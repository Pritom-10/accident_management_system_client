'use client';

import { motion } from 'framer-motion';
import Logo from '../Logo';
import { glass } from './kit';

export default function AuthShell({ icon, iconTone = 'bg-indigo-600 shadow-indigo-600/30', title, subtitle, headline, points = [], children, footer }) {
  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[1fr_1.05fr] lg:py-12">
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative hidden overflow-hidden rounded-[2rem] bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <motion.span
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/40 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-rose-500/35 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex items-center gap-2.5">
          <Logo size={34} showText={false} />
          <span className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            ResQ
          </span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-semibold leading-tight">{headline}</h2>
          <ul className="mt-8 space-y-4">
            {points.map((p, i) => (
              <motion.li
                key={p.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">{p.icon}</span>
                {p.text}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">ResQ does not replace 999. In danger, call 999 first.</p>
      </motion.aside>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center"
      >
        <div className={`${glass} w-full p-7 md:p-10`}>
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${iconTone}`}>{icon}</span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </motion.div>
    </main>
  );
}