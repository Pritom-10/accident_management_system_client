import AccidentGrid from '../../components/AccidentGrid';

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

export const metadata = { title: 'Verified accidents | Sahayota' };

export default async function AccidentsPage() {
  const accidents = await getAccidents();

  return (
    <main>
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <h1 className="text-3xl font-semibold text-slate-900">All verified accidents</h1>
        <p className="mt-2 text-sm text-slate-600">Every case confirmed by the administrator, most recent first.</p>
      </div>
      {/* showViewAll=false hides the "View all" link since we're already on the full list */}
      <AccidentGrid accidents={accidents} showViewAll={false} />
    </main>
  );
}
