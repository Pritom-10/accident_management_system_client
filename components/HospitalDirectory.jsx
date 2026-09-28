import Link from 'next/link';
import { ArrowRight, Phone, Building2, Flame, ShieldAlert, Ambulance, Siren } from 'lucide-react';
import Reveal from './Reveal';

const typeIcon = {
  hospital: Building2,
  fire_service: Flame,
  police: ShieldAlert,
  ambulance: Ambulance,
  other: Siren,
};

const typeLabel = {
  hospital: 'Hospital',
  fire_service: 'Fire service',
  police: 'Police',
  ambulance: 'Ambulance',
  other: 'Emergency',
};

export default function HospitalDirectory({ hospitals = [], showViewAll = true }) {
  return (
    <section id="hospitals" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Hospitals &amp; emergency contacts</h2>
          <p className="mt-1 text-sm text-slate-600">Tap a number to call directly.</p>
        </div>
        {showViewAll && (
          <Link href="/hospitals" className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
            View all <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {hospitals.length === 0 ? (
        <div className="rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          No hospitals added yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hospitals.map((h, i) => {
            const Icon = typeIcon[h.type] ?? Building2;
            return (
              <Reveal key={h._id} delay={i * 0.06}>
                <a
                  href={`tel:${h.phone}`}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    h.isPinned ? 'border-rose-200 bg-rose-50/60 md:col-span-2' : 'border-white/50 bg-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${h.isPinned ? 'bg-rose-600 text-white' : 'bg-white/80 text-slate-700'}`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${h.isPinned ? 'text-rose-700' : 'text-slate-900'}`}>{h.name}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{typeLabel[h.type] ?? h.type}{h.address && h.address !== 'Nationwide' ? ` · ${h.address}` : ''}</p>
                    </div>
                  </div>
                  <span className={`mono flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm ${h.isPinned ? 'bg-rose-600 text-white' : 'bg-white/80 text-slate-900'}`}>
                    <Phone size={14} /> {h.phone}
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
