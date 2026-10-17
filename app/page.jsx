import Hero from '../components/Hero';
import AccidentGrid from '../components/AccidentGrid';
import HospitalDirectory from '../components/HospitalDirectory';
import { API_BASE } from '../lib/api';

async function getJson(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [accidents, hospitals] = await Promise.all([
    getJson('/accidents'),
    getJson('/hospitals'),
  ]);

  const stats = {
    casesUnderResponse: accidents.filter((a) => a.status === 'rescue_in_progress').length,
    casesSolved: accidents.filter((a) => a.status === 'cleared').length,
    availableVolunteers: null,
  };

  return (
    <main>
      <Hero stats={stats} />
      <AccidentGrid accidents={accidents.slice(0, 4)} />
      <HospitalDirectory hospitals={hospitals.slice(0, 4)} />
    </main>
  );
}