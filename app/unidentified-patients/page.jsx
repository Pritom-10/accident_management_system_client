import { Building2, CalendarDays, Phone, UserRound, UserSearch } from 'lucide-react';
import Reveal from '../../components/Reveal';
import ZoomImage from '../../components/ui/ZoomImage';
import { PageHero } from '../../components/ui/kit';
import { glass } from '../../components/ui/styles';
import { API_BASE } from '../../lib/api';
import { imageSrc } from '../../lib/imageUrl';
import { dateText } from '../../lib/blood';

export const metadata = { title: 'Unidentified patients | ResQ' };

async function getPatients() {
  try {
    const res = await fetch(`${API_BASE}/unidentified-patients`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function UnidentifiedPatientsPage() {
  const patients = await getPatients();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <PageHero
        icon={<UserSearch size={24} />}
        tone="indigo"
        eyebrow="Someone may be waiting for you"
        title="Unidentified patients"
        subtitle="These patients are in hospital and their names are not known. If you recognise someone, call the hospital shown on the card."
      />

      {patients.length === 0 ? (
        <div className={`${glass} mt-8 p-12 text-center text-sm text-slate-600`}>No unidentified patients right now.</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p, i) => {
            // eslint-disable-next-line react-hooks/purity
            const days = p.admissionDate ? Math.max(0, Math.floor((Date.now() - new Date(p.admissionDate).getTime()) / 86400000)) : null;
            return (
              <Reveal key={p._id} delay={(i % 3) * 0.07} className="h-full">
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/10">
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {p.photoUrl ? (
                      <ZoomImage src={imageSrc(p.photoUrl)} alt="Patient" className="absolute inset-0 h-full w-full" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300"><UserRound size={56} /></div>
                    )}
                    {days !== null && (
                      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        {days === 0 ? 'Admitted today' : `Admitted ${days} ${days === 1 ? 'day' : 'days'} ago`}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <p className="text-lg font-semibold text-slate-900">
                      {p.estimatedAge ? `About ${p.estimatedAge} years old` : 'Age unknown'}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-600">{p.physicalDescription}</p>

                    <div className="mt-auto space-y-2 border-t border-slate-200/70 pt-4 text-xs text-slate-600">
                      <p className="flex items-start gap-2">
                        <Building2 size={14} className="mt-0.5 shrink-0" />
                        <span>
                          <span className="font-medium text-slate-900">{p.admittingHospital?.name}</span>
                          {p.admittingHospital?.address ? `, ${p.admittingHospital.address}` : ''}
                        </span>
                      </p>
                      {p.admissionDate && (
                        <p className="mono flex items-center gap-2"><CalendarDays size={14} /> {dateText(p.admissionDate)}</p>
                      )}
                    </div>

                    {p.admittingHospital?.phone && (
                      <a
                        href={`tel:${p.admittingHospital.phone}`}
                        className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        <Phone size={15} /> Call {p.admittingHospital.phone}
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}