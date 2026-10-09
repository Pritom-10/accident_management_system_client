import Link from 'next/link';
import { ArrowRight, MapPin, CalendarDays, UserRound } from 'lucide-react';
import Reveal from './Reveal';
import { imageSrc } from '../lib/imageUrl';

export default function MissingPersons({ people = [], showViewAll = true }) {
  return (
    <section id="missing" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Missing persons</h2>
          <p className="mt-1 text-sm text-slate-600">Approved reports, searchable by name, age and last-known location.</p>
        </div>
        {showViewAll && (
          <Link href="/missing-persons" className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
            View all <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {people.length === 0 ? (
        <div className="rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          No approved missing person reports right now.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p, i) => (
            <Reveal key={p._id} delay={i * 0.08} className="h-full">
              <div className="group h-full rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200/70 bg-slate-100">
                  {p.photoUrl ? (
                    <img src={imageSrc(p.photoUrl)} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400"><UserRound size={40} /></div>
                  )}
                </div>
                <p className="text-base font-semibold text-slate-900">{p.name}, {p.age}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin size={13} /> Last seen: {p.lastKnownLocation?.area}, {p.lastKnownLocation?.district}
                </p>
                <p className="mono mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                  <CalendarDays size={13} />
                  {p.lastSeenDateTime ? new Date(p.lastSeenDateTime).toLocaleDateString() : ''}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
