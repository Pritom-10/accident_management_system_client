'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Flame, Loader2, ExternalLink, LocateFixed, MapPinned } from 'lucide-react';
import HotspotMap from '../../components/map/HotspotMap';
import { API_BASE } from '../../lib/api';
import { bdLocations } from '../../lib/bdLocations';
import { divisionList, districtOptions } from '../../lib/locationOptions';
import { PERIODS, BANDS, MIN_OPTIONS } from '../../lib/hotspots';
import { osmLink } from '../../lib/geo';
import { formatDateTime } from '../../lib/newsOptions';

const field = 'w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700';
const label = 'mb-1 block text-xs font-medium text-slate-600';
const initialFilters = { division: '', district: '', type: '', period: '90', band: '', min: '3' };

export default function AccidentMapPage() {
  const [mode, setMode] = useState('blackspot');
  const [filters, setFilters] = useState(initialFilters);
  const [types, setTypes] = useState([]);
  const [data, setData] = useState({ cells: [], totalMatched: 0, maxCount: 0 });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [focus, setFocus] = useState(null);

  const districts = useMemo(() => districtOptions(filters.division), [filters.division]);
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  function onDivisionChange(e) {
    const division = e.target.value;
    const stillValid = !division || !filters.district || Boolean(bdLocations[division]?.[filters.district]);
    setFilters({ ...filters, division, district: stillValid ? filters.district : '' });
  }

  useEffect(() => {
    fetch(`${API_BASE}/analytics/types`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setTypes)
      .catch(() => setTypes([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set('period', filters.period);
    params.set('min', mode === 'heat' ? '1' : filters.min);
    ['division', 'district', 'type', 'band'].forEach((k) => {
      if (filters[k]) params.set(k, filters[k]);
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setFailed(false);

    fetch(`${API_BASE}/analytics/hotspots?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setFailed(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [filters, mode]);

  function showOnMap(cell) {
    // eslint-disable-next-line react-hooks/purity
    setFocus({ lat: cell.lat, lng: cell.lng, t: Date.now() });
    document.getElementById('hotspot-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const modeButton = (id, text, Icon) => (
    <button
      onClick={() => setMode(id)}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
        mode === id
          ? 'bg-slate-900 text-white'
          : 'border border-slate-300/70 bg-white/60 text-slate-700 hover:bg-white/90'
      }`}
    >
      <Icon size={16} /> {text}
    </button>
  );

  const top = data.cells.slice(0, 10);

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/25">
        <MapPinned size={24} />
      </span>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Accident map</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        See where accidents happen most. Blackspots are small areas with many cases. The heatmap shows how busy every area is.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {modeButton('blackspot', 'Blackspots', AlertTriangle)}
        {modeButton('heat', 'Heatmap', Flame)}
      </div>

      <div className="mt-5 space-y-4 rounded-2xl border border-white/50 bg-white/50 p-5 backdrop-blur-xl">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="m-division" className={label}>Division</label>
            <select id="m-division" value={filters.division} onChange={onDivisionChange} className={field}>
              <option value="">All divisions</option>
              {divisionList.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="m-district" className={label}>District</label>
            <select id="m-district" value={filters.district} onChange={set('district')} className={field}>
              <option value="">All districts</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="m-type" className={label}>Cause or type</label>
            <select id="m-type" value={filters.type} onChange={set('type')} className={field}>
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t.value} value={t.value}>{t.label} ({t.count})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="m-period" className={label}>Period</label>
            <select id="m-period" value={filters.period} onChange={set('period')} className={field}>
              {PERIODS.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="m-band" className={label}>Time of day</label>
            <select id="m-band" value={filters.band} onChange={set('band')} className={field}>
              {BANDS.map(([value, text]) => <option key={value || 'any'} value={value}>{text}</option>)}
            </select>
          </div>

          {mode === 'blackspot' && (
            <div>
              <label htmlFor="m-min" className={label}>A blackspot has at least</label>
              <select id="m-min" value={filters.min} onChange={set('min')} className={field}>
                {MIN_OPTIONS.map((n) => <option key={n} value={n}>{n} cases</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div id="hotspot-map" className="relative mt-6">
        <HotspotMap
          cells={data.cells}
          mode={mode}
          maxCount={data.maxCount}
          focus={focus}
          height={460}
          emptyText={
            failed
              ? 'Could not load the map data.'
              : mode === 'blackspot'
                ? 'No blackspot found with these filters.'
                : 'No cases with a map pin match these filters.'
          }
        />
        {loading && (
          <div className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs text-slate-600 shadow">
            <Loader2 size={14} className="animate-spin" /> Loading
          </div>
        )}
      </div>

      {mode === 'blackspot' ? (
        <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-red-700 bg-red-500/40" /> A blackspot (a bigger circle means more cases)
          </span>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span>Fewer cases</span>
          <span className="h-3 w-32 rounded-full" style={{ background: 'linear-gradient(to right, #FACC15, #F97316, #DC2626)' }} />
          <span>More cases</span>
        </div>
      )}

      <p className="mt-4 text-sm text-slate-600">
        {data.totalMatched} verified {data.totalMatched === 1 ? 'case' : 'cases'} with a map pin match these filters
        {mode === 'blackspot' ? ` · ${data.cells.length} ${data.cells.length === 1 ? 'blackspot' : 'blackspots'}` : ''}.
      </p>

      {mode === 'blackspot' && top.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-900">Top blackspots</h2>
          <p className="mt-1 text-xs text-slate-500">
            Each blackspot is an area about 1 km wide. Cases near the edge of two areas can be counted in different ones.
          </p>

          <div className="mt-4 space-y-3">
            {top.map((c, i) => (
              <div
                key={`${c.lat}-${c.lng}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <span className="mono flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {[c.area, c.district].filter(Boolean).join(', ') || 'Area not named'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {c.count} cases · latest {formatDateTime(c.latest)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => showOnMap(c)}
                    className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    <LocateFixed size={14} /> Show on map
                  </button>
                  <a
                    href={osmLink(c.lat, c.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <ExternalLink size={14} /> OpenStreetMap
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}