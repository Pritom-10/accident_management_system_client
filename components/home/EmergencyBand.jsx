'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, Siren } from 'lucide-react';

export default function EmergencyBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-16 text-center text-white md:px-14"
      >
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-600/25 blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative mx-auto max-w-2xl">
          <span className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-rose-500"
              animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-rose-500"
              animate={{ scale: [1, 1.8], opacity: [0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
            />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 shadow-xl shadow-rose-600/40">
              <Phone size={32} />
            </span>
          </span>

          <h2 className="mt-8 text-3xl font-semibold leading-tight md:text-5xl">In danger right now? Call 999 first.</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Get help on the way first. Then tell us here, so volunteers, hospitals and blood donors can respond too.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <motion.a
              href="tel:999"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full bg-rose-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-rose-600/30 hover:bg-rose-700"
            >
              <Phone size={18} /> Call 999
            </motion.a>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/report"
                className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-8 py-4 text-base font-medium text-white backdrop-blur-xl hover:bg-white/20"
              >
                <Siren size={18} /> Then report it here
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}