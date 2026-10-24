import Link from 'next/link';
import { MapPinned, Siren } from 'lucide-react';
import AccidentCard from '../../components/AccidentCard';
import AccidentFilters from '../../components/AccidentFilters';
import Pagination from '../../components/Pagination';
import MapView from '../../components/map/MapView';
import Reveal from '../../components/Reveal';
import { PageHero, glass } from '../../components/ui/kit';
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
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <PageHero
        icon={<MapPinned size={24} />}
        tone="rose"
        eyebrow="Checked by admins"
        title="Verified accidents"
        subtitle="Every case here was checked before it was shown. Tap a pin on the map, or search by place."
        actions={
          <>
            <Link href="/report" className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700">
              <Siren size={16} /> Report an accident
            </Link>
            <Link href="/map" className="rounded-full border border-slate-300/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white">
              Blackspot map
            </Link>
          </>
        }
        aside={
          list && (
            <div className="flex gap-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-3 backdrop-blur-xl">
                <p className="mono text-2xl text-slate-900">{list.total}</p>
                <p className="text-xs text-slate-600">{hasFilters ? 'Matching cases' : 'Verified cases'}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-3 backdrop-blur-xl">
                <p className="mono text-2xl text-slate-900">{markers.length}</p>
                <p className="text-xs text-slate-600">On the map</p>
              </div>
            </div>
          )
        }
      />

      <div className="mt-6">
        <AccidentFilters key={JSON.stringify(filters)} initial={filters} />
      </div>

      <div className={`${glass} mt-6 p-2`}>
        <MapView markers={markers} height={400} emptyText="No cases with a map location match this search." />
        <div className="flex flex-wrap items-center gap-5 px-4 py-3 text-xs text-slate-600">
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-rose-600" /> Rescue in progress</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-600" /> Cleared</span>
        </div>
      </div>

      {list === null ? (
        <div className={`${glass} mt-8 p-10 text-center text-sm text-slate-600`}>
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
            <div className={`${glass} mt-4 p-10 text-center text-sm text-slate-600`}>
              {hasFilters ? 'No case matches this search. Try fewer filters.' : 'No verified accidents right now.'}
            </div>
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {list.items.map((a, i) => (
                <Reveal key={a.caseId} delay={(i % 4) * 0.07} className="h-full">
                  <AccidentCard accident={a} />
                </Reveal>
              ))}
            </div>
          )}

          <Pagination basePath="/accidents" params={filters} page={list.page} pages={list.pages} />
        </>
      )}
    </main>
  );
}