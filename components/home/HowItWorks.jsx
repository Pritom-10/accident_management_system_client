'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { HeartHandshake, MapPinned, ShieldCheck, Siren } from 'lucide-react';

const steps = [
  {
    icon: Siren,
    tone: 'bg-rose-500',
    title: 'Someone reports',
    text: 'Anyone can report an accident from their phone. No account, no waiting in a queue.',
  },
  {
    icon: ShieldCheck,
    tone: 'bg-indigo-500',
    title: 'Admins verify',
    text: 'Every report is checked before the public sees it, so false alarms do not spread.',
  },
  {
    icon: MapPinned,
    tone: 'bg-sky-500',
    title: 'The map lights up',
    text: 'Verified cases appear on the map. Volunteers and hospitals can see where help is needed.',
  },
  {
    icon: HeartHandshake,
    tone: 'bg-emerald-500',
    title: 'Neighbours help',
    text: 'Donors give blood and money. Every taka is tracked in public, with a photo of each bill.',
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 110, damping: 26, restDelta: 0.001 });

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-14 text-white md:px-14 md:py-20">
        <motion.div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-rose-500/25 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <h2 className="text-3xl font-semibold leading-tight md:text-5xl">From a phone call to real help.</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              Here is how one report turns into action. Scroll down to follow it.
            </p>
          </div>

          <ol ref={ref} className="relative space-y-12 pl-16">
            <span className="absolute bottom-2 left-6 top-2 w-0.5 rounded-full bg-white/15" />
            <motion.span
              style={{ scaleY: fill }}
              className="absolute bottom-2 left-6 top-2 w-0.5 origin-top rounded-full bg-gradient-to-b from-rose-400 via-violet-400 to-emerald-400"
            />

            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, x: 36 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-90px' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <span className={`absolute -left-16 top-0 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${s.tone}`}>
                    <Icon size={22} />
                  </span>
                  <p className="mono text-xs text-slate-400">Step {i + 1}</p>
                  <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">{s.text}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}