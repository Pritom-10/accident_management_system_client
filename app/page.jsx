import Hero from '../components/Hero';
import LatestBlood from '../components/LatestBlood';
import LatestNews from '../components/LatestNews';
import AccidentGrid from '../components/AccidentGrid';
import HospitalDirectory from '../components/HospitalDirectory';
import { API_BASE } from '../lib/api';

async function getJson(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [accidents, hospitals, news, blood] = await Promise.all([
    getJson('/accidents', []),
    getJson('/hospitals', []),
    getJson('/news?limit=3', { items: [] }),
    getJson('/blood/requests?limit=3', { items: [] }),
  ]);

  const stats = {
    casesUnderResponse: accidents.filter((a) => a.status === 'rescue_in_progress').length,
    casesSolved: accidents.filter((a) => a.status === 'cleared').length,
    availableVolunteers: null,
  };

  return (
    <main>
      <Hero stats={stats} />
      <LatestBlood requests={blood.items || []} />
      <LatestNews posts={news.items || []} />
      <AccidentGrid accidents={accidents.slice(0, 4)} />
      <HospitalDirectory hospitals={hospitals.slice(0, 4)} />
    </main>
  );
}