'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Menu, X, LogIn, LogOut, UserPlus, ChevronDown,
  Building2, UserSearch, LayoutDashboard,ShieldCheck, UserRound,
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from './AuthProvider';

const hospitalMenu = [
  { label: 'Hospital directory', desc: 'Contacts and admitted patient counts', href: '/hospitals', icon: Building2 },
  { label: 'Unidentified patients', desc: 'Admitted patients not yet identified', href: '/unidentified-patients', icon: UserSearch },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false); // mobile menu
  const [dropdown, setDropdown] = useState(false); // desktop dropdown
  const dropdownRef = useRef(null);

  const canVolunteer = user && (user.roles.includes('volunteer') || user.roles.includes('admin'));
  const isAdmin = user && user.roles.includes('admin');
  const firstName = user ? user.name.split(' ')[0] : '';


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
    setDropdown(false);
  }, [pathname]);


  useEffect(() => {
    function onClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdown(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const hospitalActive = hospitalMenu.some((i) => isActive(i.href));

  const pill = (active) =>
    `rounded-full px-4 py-2 text-sm transition-colors ${
      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
    }`;

  function handleLogout() {
    logout();
    setOpen(false);
    toast.success('Logged out');
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" aria-label="Sahayota home">
          <Logo />
        </Link>

    
        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/" className={pill(isActive('/'))}>Home</Link>
          <Link href="/accidents" className={pill(isActive('/accidents'))}>Accidents</Link>

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdown(!dropdown)}
              className={`${pill(hospitalActive)} flex items-center gap-1.5`}
            >
              Hospitals &amp; Patients
              <ChevronDown size={14} className={`transition-transform ${dropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-white/60 bg-white/90 p-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl"
                >
                  {hospitalMenu.map(({ label, desc, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-100/80 ${
                        isActive(href) ? 'bg-slate-100/80' : ''
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-slate-900">{label}</span>
                        <span className="block text-xs text-slate-600">{desc}</span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        
        <div className="hidden items-center gap-3 lg:flex">
          {loading ? (
            <div className="h-9 w-44" />
          ) : user ? (
            <>
              {canVolunteer && (
                <Link
                  href="/volunteer/dashboard"
                  className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur hover:bg-white/90"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
                            {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
              <Link href="/profile"className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-700 hover:bg-white/70"><UserRound size={16} /> {firstName}</Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/60 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur hover:bg-white/90"
              >
                <LogIn size={16} /> Login
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
              >
                <UserPlus size={16} /> Register
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-full p-2 text-slate-700 hover:bg-white/70 lg:hidden"
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
            className="overflow-hidden border-t border-white/40 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              <Link href="/" className={`rounded-xl px-4 py-3 text-sm ${isActive('/') ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'}`}>Home</Link>
              <Link href="/accidents" className={`rounded-xl px-4 py-3 text-sm ${isActive('/accidents') ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'}`}>Accidents</Link>

              <p className="mt-2 px-4 text-xs font-medium uppercase tracking-wide text-slate-500">Hospitals &amp; Patients</p>
              {hospitalMenu.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                    isActive(href) ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white/70'
                  }`}
                >
                  <Icon size={16} /> {label}
                </Link>
              ))}

              {!loading && user ? (
                <>
                  {canVolunteer && (
                    <Link href="/volunteer/dashboard" className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-white/70">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  )}
                                               {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-white/70">
                      <ShieldCheck size={16} /> Admin panel
                    </Link>
                  )}
                  <Link href="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-700 hover:bg-white/70">
  <UserRound size={16} /> My profile ({user.name})
</Link>
                  <button onClick={handleLogout} className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white">
                    Logout
                  </button>
                </>
              ) : (
                !loading && (
                  <>
                    <Link href="/login" className="mt-2 rounded-xl border border-slate-300/70 bg-white/60 px-4 py-3 text-center text-sm font-medium text-slate-700">
                      Login
                    </Link>
                    <Link href="/register" className="rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white">
                      Register
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}