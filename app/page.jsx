import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AccidentGrid from '../components/AccidentGrid';
import HospitalDirectory from '../components/HospitalDirectory';
import MissingPersons from '../components/MissingPersons';
import Footer from '../components/Footer';

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
    casesUnderResponse: accidents.filter(
      (a) => a.status === "rescue_in_progress",
    ).length,
    resolvedCases: accidents.filter((a) => a.status === "cleared").length,
    availableVolunteers: null,
  };

  return (
    <main>
      <Navbar />
      <Hero stats={stats} />
      <AccidentGrid accidents={accidents} />
      <HospitalDirectory hospitals={hospitals} />
      <MissingPersons people={missing} />
      <Footer />
    </main>
  );
}
