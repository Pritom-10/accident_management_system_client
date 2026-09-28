'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, LogIn, HeartHandshake } from 'lucide-react';
import Logo from './Logo';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Accidents', href: '/accidents' },
  { label: 'Hospitals', href: '/hospitals' },
  { label: 'Missing persons', href: '/missing-persons' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" aria-label="Sahayota home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                isActive(l.href)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur hover:bg-white/90"
          >
            <LogIn size={16} /> Login
          </Link>
          <Link
            href="/volunteer/register"
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            <HeartHandshake size={16} /> Sign up as Volunteer
          </Link>
        </div>

        <button
          className="rounded-full p-2 text-slate-700 hover:bg-white/70 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/40 md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm ${
                    isActive(l.href) ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setOpen(false)} className="mt-2 rounded-xl border border-slate-300/70 bg-white/60 px-4 py-3 text-center text-sm font-medium text-slate-700">
                Login
              </Link>
              <Link href="/volunteer/register" onClick={() => setOpen(false)} className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white">
                Sign up as Volunteer
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
