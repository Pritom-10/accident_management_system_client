'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Ambulance, BedDouble, HeartHandshake, LayoutDashboard, UserPlus, UserSearch } from 'lucide-react';
import { useAuth } from '../AuthProvider';

const chips = [
  { icon: BedDouble, text: 'Update hospital patient counts', pos: 'right-8 top-8', delay: 0 },
  { icon: UserSearch, text: 'Report unidentified patients', pos: 'right-24 top-28', delay: 0.7 },
  { icon: Ambulance, text: 'Be on the scene first', pos: 'right-4 top-48', delay: 1.4 },
];

export default function VolunteerBand() {
  const { user, loading } = useAuth();
  if (loading) return null;

  const roles = user?.roles || [];
  const isVolunteer = roles.includes('volunteer') || roles.includes('admin');
  if (user && !isVolunteer) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-14 text-white md:px-14"
      >
        <motion.div
          className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-xl">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <HeartHandshake size={24} />
          </span>
          <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">Be the first hand that reaches out.</h2>
          <p className="mt-3 text-sm leading-relaxed text-indigo-100">
            Volunteers keep hospital patient counts up to date and report patients nobody has identified yet. An admin approves every volunteer.
          </p>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="mt-7 inline-block">
            {isVolunteer ? (
              <Link href="/volunteer/dashboard" className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700">
                <LayoutDashboard size={17} /> Open your dashboard
              </Link>
            ) : (
              <Link href="/register" className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-indigo-700">
                <UserPlus size={17} /> Join as a volunteer
              </Link>
            )}
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          {chips.map(({ icon: Icon, text, pos, delay }) => (
            <motion.div
              key={text}
              className={`absolute ${pos} flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm backdrop-blur-xl`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
            >
              <Icon size={16} /> {text}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}