import { MapPinned } from 'lucide-react';
import AccidentCard from '../../components/AccidentCard';
import AccidentFilters from '../../components/AccidentFilters';
import Pagination from '../../components/Pagination';
import MapView from '../../components/map/MapView';
import { API_BASE } from '../../lib/api';

const FILTER_KEYS = ['division', 'district', 'area', 'status'];

export const metadata = { title: 'Accidents | Sahayota' };

async function getJson(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AccidentsPage({ searchParams }) {
  const sp = (await searchParams) || {};

  const filters = {};
  for (const k of FILTER_KEYS) {
    if (typeof sp[k] === 'string' && sp[k]) filters[k] = sp[k];
  }
  const page = typeof sp.page === 'string' ? sp.page : '1';
  const filterQuery = new URLSearchParams(filters).toString();

  const [list, pins] = await Promise.all([
    getJson(`/accidents/search?${new URLSearchParams({ ...filters, page, limit: '8' }).toString()}`),
    getJson(`/accidents/map${filterQuery ? `?${filterQuery}` : ''}`),
  ]);

  const markers = (pins || []).map((p) => ({
    id: p.caseId,
    lat: p.location.lat,
    lng: p.location.lng,
    status: p.status,
    title: p.accidentType,
    subtitle: [p.location.area, p.location.district].filter(Boolean).join(', '),
    href: `/accidents/${p.caseId}`,
  }));

  const hasFilters = Object.keys(filters).length > 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
        <MapPinned size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Accidents</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Every case here was checked by an administrator. Tap a pin on the map to see the case.
      </p>

      <div className="mt-8">
        <AccidentFilters key={JSON.stringify(filters)} initial={filters} />
      </div>

      <div className="mt-6">
        <MapView markers={markers} height={420} emptyText="No cases with a map location match this search." />
        <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-600" /> Rescue in progress
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-600" /> Cleared
          </span>
        </div>
      </div>

      {list === null ? (
        <div className="mt-8 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
          Could not load the cases. Please try again in a moment.
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-slate-600">
            {list.total} {list.total === 1 ? 'case' : 'cases'}
            {hasFilters ? ' match your search' : ''}
            {list.pages > 1 ? ` · page ${list.page} of ${list.pages}` : ''}
          </p>

          {list.items.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-600 backdrop-blur-xl">
              {hasFilters ? 'No case matches this search. Try fewer filters.' : 'No verified accidents right now.'}
            </div>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {list.items.map((a) => (
                <AccidentCard key={a.caseId} accident={a} />
              ))}
            </div>
          )}

          <Pagination basePath="/accidents" params={filters} page={list.page} pages={list.pages} />
        </>
      )}
    </main>
  );
}