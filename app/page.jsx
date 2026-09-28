import Hero from '../components/Hero';
import AccidentGrid from '../components/AccidentGrid';
import HospitalDirectory from '../components/HospitalDirectory';
import MissingPersons from '../components/MissingPersons';

const API_BASE = 'http://localhost:5000/api';

async function getAccidents() {
  try {
    const res = await fetch(`${API_BASE}/accidents`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getHospitals() {
  try {
    const res = await fetch(`${API_BASE}/hospitals`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getMissingPersons() {
  try {
    const res = await fetch(`${API_BASE}/missing-persons`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [accidents, hospitals, missing] = await Promise.all([
    getAccidents(),
    getHospitals(),
    getMissingPersons(),
  ]);

  const districts = new Set([
    ...accidents.map((a) => a.location?.district).filter(Boolean),
    ...hospitals.map((h) => h.district).filter(Boolean),
  ]);

  const stats = {
    casesUnderResponse: accidents.filter((a) => a.status === 'rescue_in_progress').length,
    districtsCovered: districts.size,
    availableVolunteers: null,
  };

  return (
    <main>
      <Hero stats={stats} />
      {/* homepage only shows a short preview of each — full lists live on their own pages */}
      <AccidentGrid accidents={accidents.slice(0, 4)} />
      <HospitalDirectory hospitals={hospitals.slice(0, 4)} />
      <MissingPersons people={missing.slice(0, 3)} />
    </main>
  );
}
