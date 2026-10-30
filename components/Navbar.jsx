'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Building2, ChevronDown, ClipboardList, Droplet, HeartHandshake, LayoutDashboard, LogIn, LogOut,
  MapPinned, Menu, PenLine, Phone, Receipt, ShieldCheck, Siren, UserPlus, UserRound, UserSearch, X,
  BellRing, HeartPulse, Bell, Scale

} from 'lucide-react';
import Logo from './Logo';
import { detachDevice } from '../lib/push';
import { useAuth } from './AuthProvider';
import { imageSrc } from '../lib/imageUrl';
import VerifiedMark from './ui/VerifiedMark';

const primary = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Accidents', href: '/accidents' },
  { label: 'Blood', href: '/blood' },
  { label: 'Donate', href: '/donate' },
];

const hospitalLinks = [
  {
    title: 'Hospital directory',
    desc: 'Phone numbers, 999, and how many patients are admitted',
    href: '/hospitals',
    icon: Building2,
    tone: 'bg-sky-100 text-sky-600',
  },
  {
    title: 'Unidentified patients',
    desc: 'Patients in hospital whose names are not known yet',
    href: '/unidentified-patients',
    icon: UserSearch,
    tone: 'bg-indigo-100 text-indigo-600',
  },
];

const quickLinks = [
  { title: 'Send an SOS', desc: 'One tap. Volunteers are told', href: '/sos', icon: Siren, tone: 'bg-rose-100 text-rose-600' },
  { title: 'First aid guide', desc: 'CPR, bleeding, broken bones', href: '/first-aid', icon: HeartPulse, tone: 'bg-emerald-100 text-emerald-600' },
  { title: 'Report an accident', desc: 'No account needed', href: '/report', icon: PenLine, tone: 'bg-amber-100 text-amber-600' },
  { title: 'Accident map', desc: 'Blackspots and heatmap', href: '/map', icon: MapPinned, tone: 'bg-violet-100 text-violet-600' },
  { title: 'Find blood donors', desc: 'By group and area', href: '/blood/donors', icon: Droplet, tone: 'bg-rose-100 text-rose-600' },
  { title: 'Alerts on your phone', desc: 'SOS, blood and breaking news', href: '/notifications', icon: Bell, tone: 'bg-violet-100 text-violet-600' },
  { title: 'Legal help and counseling', desc: 'What to do after an accident', href: '/help', icon: Scale, tone: 'bg-indigo-100 text-indigo-600' },
];

const exploreRoots = ['/hospitals', '/unidentified-patients', '/map', '/report', '/sos', '/first-aid', '/help'];

function Avatar({ user, size = 36 }) {
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user.photoUrl) {
    return (
      <img
        src={imageSrc(user.photoUrl)}
        alt=""
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full border border-white object-cover"
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size, background: 'linear-gradient(135deg, #F43F5E, #4F46E5)' }}
      className="flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
    >
      {initials}
    </span>
  );
}

function PanelCard({ item }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-100/80">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${item.tone}`}>
        <Icon size={20} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-slate-600">{item.desc}</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const exploreRef = useRef(null);
  const accountRef = useRef(null);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 12));

  const roles = user?.roles || [];
  const isAdmin = roles.includes('admin');
  const canVolunteer = isAdmin || roles.includes('volunteer');
  const canWrite = isAdmin || roles.includes('journalist');
  const isStaff = Boolean(user && (roles.includes('hospital') || roles.includes('bloodbank')));
  const firstName = user ? user.name.split(' ')[0] : '';

  const accountItems = user
    ? [
        { label: 'My profile', href: '/profile', icon: UserRound },
        { label: 'Alert settings', href: '/notifications', icon: Bell },
        { label: 'Medical ID', href: '/profile/medical-id', icon: HeartPulse },
        { label: 'Blood activity', href: '/blood/mine', icon: ClipboardList },
        { label: user.donor?.isDonor ? 'Donor profile' : 'Become a donor', href: '/blood/donor', icon: Droplet },
        { label: 'Campaigns and donations', href: '/donate/mine', icon: Receipt },
        ...(canVolunteer ? [{ label: 'Volunteer dashboard', href: '/volunteer/dashboard', icon: LayoutDashboard }] : []),
        ...(canVolunteer || user.donor?.isDonor ? [{ label: 'Nearby SOS alerts', href: '/sos/nearby', icon: BellRing }] : []),
        ...(canWrite ? [{ label: 'My news posts', href: '/news/mine', icon: PenLine }] : []),
        ...(isStaff || isAdmin ? [{ label: 'Hospital live numbers', href: '/hospital/manage', icon: Building2 }] : []),
        ...(isAdmin ? [{ label: 'Admin panel', href: '/admin', icon: ShieldCheck }] : []),
      ]
    : [];

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const exploreActive = exploreRoots.some((h) => pathname.startsWith(h));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setExploreOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onDown(e) {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) setExploreOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setExploreOpen(false);
        setAccountOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  async function handleLogout() {
    await detachDevice();
    logout();
    setAccountOpen(false);
    setMobileOpen(false);
    toast.success('Logged out');
    router.push('/');
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress, background: 'linear-gradient(90deg, #F43F5E, #8B5CF6, #4F46E5)' }}
        className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left"
      />

      <header className="sticky top-0 z-40 px-4 pt-3">
        <nav
          aria-label="Main"
          className={`relative mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/70 bg-white/70 px-3 py-2 backdrop-blur-xl transition-shadow duration-300 ${
            scrolled ? 'shadow-xl shadow-slate-900/10' : 'shadow-sm shadow-slate-900/5'
          }`}
        >
          <Link href="/" aria-label="ResQ home" className="pl-2">
            <Logo size={30} />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {primary.map((l) => {
              const active = isActive(l.href);
              return (
                <Link key={l.href} href={l.href} className="relative rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-900/5">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-slate-900"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className={`relative ${active ? 'text-white' : 'text-slate-600'}`}>{l.label}</span>
                </Link>
              );
            })}

            <div ref={exploreRef}>
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                aria-expanded={exploreOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  exploreOpen || exploreActive ? 'bg-slate-900/10 text-slate-900' : 'text-slate-600 hover:bg-slate-900/5'
                }`}
              >
                Explore
                <ChevronDown size={14} className={`transition-transform duration-300 ${exploreOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {exploreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-x-0 top-full mx-auto mt-3 w-[min(36rem,100%)] rounded-3xl border border-white/70 bg-white/95 p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-xl"
                  >
                    <p className="px-3 pb-1 pt-1 text-xs font-medium text-slate-500">Hospitals and patients</p>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {hospitalLinks.map((item) => <PanelCard key={item.href} item={item} />)}
                    </div>

                    <p className="px-3 pb-1 pt-4 text-xs font-medium text-slate-500">Quick actions</p>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {quickLinks.map((item) => <PanelCard key={item.href} item={item} />)}
                    </div>

                    <a
                      href="tel:999"
                      className="mt-3 flex items-center justify-between rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700"
                    >
                      <span>In danger right now? Call 999</span>
                      <Phone size={16} />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {loading ? (
              <div className="h-10 w-36" />
            ) : user ? (
              <div ref={accountRef} className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1 pl-1 pr-3 transition-colors hover:bg-white"
                >
                  <Avatar user={user} size={32} />
                  <span className="max-w-[7rem] truncate text-sm font-medium text-slate-800">{firstName}</span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-3 w-64 rounded-3xl border border-white/70 bg-white/95 p-2 shadow-2xl shadow-slate-900/15 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-3 px-3 py-3">
                        <Avatar user={user} size={40} />
                        <div className="min-w-0">
                         <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900">
                            <span className="truncate">{user.name}</span>
                            {user.verified && <VerifiedMark size={15} />}
                          </p>
                          <p className="truncate text-xs text-slate-500">{user.email || user.phone}</p>
                        </div>
                      </div>
                      <div className="my-1 h-px bg-slate-200/70" />
                      {accountItems.map(({ label, href, icon: Icon }) => (
                        <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100">
                          <Icon size={16} className="text-slate-500" /> {label}
                        </Link>
                      ))}
                      <div className="my-1 h-px bg-slate-200/70" />
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50">
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-900/5">
                  <LogIn size={16} /> Login
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-slate-900/20 hover:bg-slate-800"
                  >
                    <UserPlus size={16} /> Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="rounded-full p-2.5 text-slate-700 transition-colors hover:bg-slate-900/5 lg:hidden"
          >
            <Menu size={22} />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
        {mobileOpen && (
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[61] flex w-[88%] max-w-sm flex-col overflow-y-auto bg-white p-5 shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo size={28} />
              <button onClick={closeMobile} aria-label="Close menu" className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100">
                <X size={22} />
              </button>
            </div>

            <div className="mt-6 space-y-1">
              {primary.map((l, i) => (
                <motion.div key={l.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                  <Link
                    href={l.href}
                    onClick={closeMobile}
                    className={`block rounded-2xl px-4 py-3 text-lg font-semibold transition-colors ${
                      isActive(l.href) ? 'bg-slate-900 text-white' : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <p className="mt-6 px-4 text-xs font-medium text-slate-500">Hospitals and patients</p>
            <div className="mt-1 space-y-1">
              {hospitalLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}>
                    <Link href={item.href} onClick={closeMobile} className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-slate-100">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}><Icon size={18} /></span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                        <span className="block text-xs text-slate-600">{item.desc}</span>
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <p className="mt-4 px-4 text-xs font-medium text-slate-500">Quick actions</p>
            <div className="mt-1 space-y-1">
              {quickLinks.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.33 + i * 0.04 }}>
                    <Link href={item.href} onClick={closeMobile} className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.tone}`}><Icon size={17} /></span>
                      {item.title}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-auto space-y-3 pt-6">
              {!loading && user ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <Avatar user={user} size={40} />
                    <div className="min-w-0">
                     <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900">
                            <span className="truncate">{user.name}</span>
                            {user.verified && <VerifiedMark size={15} />}
                          </p>
                      <p className="truncate text-xs text-slate-500">{user.email || user.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {accountItems.map(({ label, href, icon: Icon }) => (
                      <Link key={href} href={href} onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100">
                        <Icon size={16} className="text-slate-500" /> {label}
                      </Link>
                    ))}
                  </div>
                  <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-rose-600">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                !loading && (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={closeMobile} className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700">
                      Login
                    </Link>
                    <Link href="/register" onClick={closeMobile} className="rounded-full bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white">
                      Register
                    </Link>
                  </div>
                )
              )}

              <a href="tel:999" className="flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-3.5 text-sm font-semibold text-white">
                <Phone size={16} /> Emergency: call 999
              </a>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}