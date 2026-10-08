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

  const stats = {
    casesUnderResponse: accidents.filter((a) => a.status === 'rescue_in_progress').length,
    casesSolved: accidents.filter((a) => a.status === 'cleared').length,
    availableVolunteers: null, // volunteer route বানানোর পর এখানে আসল সংখ্যা বসবে
  };

  return (
    <main>
      <Hero stats={stats} />
      <AccidentGrid accidents={accidents.slice(0, 4)} />
      <HospitalDirectory hospitals={hospitals.slice(0, 4)} />
      <MissingPersons people={missing.slice(0, 3)} />
    </main>
  );
}