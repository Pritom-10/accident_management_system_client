import MissingPersons from '../../components/MissingPersons';

const API_BASE = 'http://localhost:5000/api';

async function getMissingPersons() {
  try {
    const res = await fetch(`${API_BASE}/missing-persons`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export const metadata = { title: 'Missing persons | ResQ' };

export default async function MissingPersonsPage() {
  const missing = await getMissingPersons();

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Missing persons</h1>
            <p className="mt-2 text-sm text-slate-600">All admin-approved reports.</p>
          </div>
          <a
            href="/missing-persons/report"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            Report a missing person
          </a>
        </div>
      </div>
      <MissingPersons people={missing} showViewAll={false} />
    </main>
  );
}
