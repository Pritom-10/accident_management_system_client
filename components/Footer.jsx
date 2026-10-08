import Link from 'next/link';
import { Phone } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-white/40">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
        <div>
          <Logo size={28} />
          <p className="mt-2 text-xs text-slate-600">Accident &amp; emergency response, Bangladesh.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <Link href="/accidents" className="hover:text-slate-900">Accidents</Link>
          <Link href="/hospitals" className="hover:text-slate-900">Hospitals</Link>
          <Link href="/missing-persons" className="hover:text-slate-900">Missing persons</Link>
          <a href="tel:999" className="flex items-center gap-1.5 font-medium text-rose-600 hover:underline">
            <Phone size={14} /> Emergency: 999
          </a>
        </div>
      </div>
    </footer>
  );
}