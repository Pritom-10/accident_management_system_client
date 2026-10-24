import { Building2 } from 'lucide-react';
import HospitalExplorer from '../../components/hospitals/HospitalExplorer';
import { PageHero } from '../../components/ui/kit';
import { API_BASE } from '../../lib/api';

export const metadata = { title: 'Hospitals and emergency numbers | Sahayota' };

async function getHospitals() {
  try {
    const res = await fetch(`${API_BASE}/hospitals`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HospitalsPage() {
  const hospitals = await getHospitals();
  const real = hospitals.filter((h) => !h.isPinned);
  const admitted = real.reduce((sum, h) => sum + (h.patientCount || 0), 0);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Building2 size={24} />}
        tone="sky"
        eyebrow="Tap a number to call"
        title="Hospitals and emergency numbers"
        subtitle="Search by name or place. Admitted patient counts are updated by volunteers."
        aside={
          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-3 backdrop-blur-xl">
              <p className="mono text-2xl text-slate-900">{real.length}</p>
              <p className="text-xs text-slate-600">Listed</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-3 backdrop-blur-xl">
              <p className="mono text-2xl text-slate-900">{admitted}</p>
              <p className="text-xs text-slate-600">Patients admitted</p>
            </div>
          </div>
        }
      />

      <HospitalExplorer hospitals={hospitals} />
    </main>
  );
}