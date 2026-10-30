import Link from 'next/link';
import { HeartPulse, Phone, Siren } from 'lucide-react';
import Logo from './Logo';
import BackToTop from './ui/BackToTop';

const columns = [
  {
    title: 'Get help',
    links: [
      ['Send an SOS', '/sos'],
      ['First aid guide', '/first-aid'],
      ['Report an accident', '/report'],
      ['Hospitals and numbers', '/hospitals'],
      ['Unidentified patients', '/unidentified-patients'],
      ['Legal help and counseling', '/help'],
    ],
  },
  {
    title: 'Explore',
    links: [
      ['Accident news', '/news'],
      ['Verified cases', '/accidents'],
      ['Accident map', '/map'],
      ['Alerts on your phone', '/notifications'],
      ['Points and badges', '/rewards'],
    ],
  },
  {
    title: 'Help others',
    links: [
      ['Blood requests', '/blood'],
      ['Become a blood donor', '/blood/donor'],
      ['Treatment campaigns', '/donate'],
      ['Start a campaign', '/donate/start'],
      ['Join as a volunteer', '/register'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 px-3 pb-3 md:px-5 md:pb-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-slate-300">
        <span className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-14 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <Logo size={36} showText={false} />
                <span className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  ResQ
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Accident news, SOS, blood donors and treatment fundraising for Bangladesh. Checked by admins, shown in the open.
              </p>

              <a
                href="tel:999"
                className="mt-6 flex w-fit items-center gap-3 rounded-2xl bg-rose-600 px-5 py-3.5 text-white shadow-lg shadow-rose-600/25 transition-transform hover:scale-[1.03]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Phone size={20} />
                </span>
                <span>
                  <span className="block text-xs text-rose-100">National emergency</span>
                  <span className="mono block text-xl font-semibold leading-none">999</span>
                </span>
              </a>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {columns.map((c) => (
                <div key={c.title}>
                  <p className="text-sm font-semibold text-white">{c.title}</p>
                  <ul className="mt-4 space-y-2.5">
                    {c.links.map(([text, href]) => (
                      <li key={href}>
                        <Link href={href} className="text-sm text-slate-400 transition-colors hover:text-white">
                          {text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} ResQ. Made in Bangladesh.</p>
            <p className="flex items-center gap-2">
              <Siren size={13} /> ResQ does not replace 999. In danger, call 999 first.
            </p>
            <Link href="/first-aid" className="flex items-center gap-1.5 text-slate-400 hover:text-white">
              <HeartPulse size={13} /> First aid guide
            </Link>
          </div>
        </div>
      </div>
      <BackToTop />
    </footer>
  );
}