import HospitalDirectory from '../../components/HospitalDirectory';

const API_BASE = 'http://localhost:5000/api';

async function getHospitals() {
  try {
    const res = await fetch(`${API_BASE}/hospitals`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export const metadata = { title: 'Hospitals & emergency contacts | Sahayota' };

export default async function HospitalsPage() {
  const hospitals = await getHospitals();

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <h1 className="text-3xl font-semibold text-slate-900">Hospitals &amp; emergency contacts</h1>
        <p className="mt-2 text-sm text-slate-600">The full directory. Tap any number to call directly.</p>
      </div>
      <HospitalDirectory hospitals={hospitals} showViewAll={false} />
    </main>
  );
}
