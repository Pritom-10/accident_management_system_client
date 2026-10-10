import { UserSearch, Building2, CalendarDays, UserRound } from 'lucide-react';
import { imageSrc } from '../../lib/imageUrl';

const API_BASE = 'http://localhost:5000/api';

async function getPatients() {
  try {
    const res = await fetch(`${API_BASE}/unidentified-patients`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export const metadata = { title: 'Unidentified patients | ResQ' };

export default async function UnidentifiedPatientsPage() {
  const patients = await getPatients();

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        <UserSearch size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Unidentified patients</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Patients admitted to hospitals whose identity is not known yet. If you recognise someone,
        please contact the hospital listed on the card.
      </p>

      {patients.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          No unidentified patients right now.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <div key={p._id} className="rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl">
              <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200/70 bg-slate-100">
                {p.photoUrl ? (
                 <img src={imageSrc(p.photoUrl)} alt="Patient" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400"><UserRound size={40} /></div>
                )}
              </div>

              <p className="text-base font-semibold text-slate-900">
                {p.estimatedAge ? `About ${p.estimatedAge} years old` : 'Age unknown'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.physicalDescription}</p>

              <div className="mt-4 space-y-1.5 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
                <p className="flex items-start gap-1.5">
                  <Building2 size={13} className="mt-0.5 shrink-0" />
                  <span>
                    {p.admittingHospital?.name}
                    {p.admittingHospital?.address ? `, ${p.admittingHospital.address}` : ''}
                    {p.admittingHospital?.phone ? ` · ${p.admittingHospital.phone}` : ''}
                  </span>
                </p>
                <p className="mono flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  Admitted: {p.admissionDate ? new Date(p.admissionDate).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}