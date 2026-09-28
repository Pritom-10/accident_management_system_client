export default function Hero({ stats }) {
  return (
    <section className="border-b border-white/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.3fr_1fr] md:py-24">
        <div>
          <p className="mono text-xs uppercase tracking-widest text-slate-600">
            live updates, every district
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Know what&rsquo;s happening near you, before it&rsquo;s too late.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
            Verified accident reports, hospital contacts and missing person alerts for every
            division, district and area — updated the moment our administrators confirm them.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/report"
              className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700"
            >
              Report an emergency
            </a>
            <a
              href="/missing-persons"
              className="rounded-full border border-slate-300/70 bg-white/60 px-5 py-3 text-sm font-medium text-slate-700 backdrop-blur hover:bg-white/90"
            >
              Search missing persons
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 rounded-2xl border border-white/50 bg-white/40 p-6 backdrop-blur-xl">
            <div>
              <p className="mono text-2xl text-slate-900">{stats.casesUnderResponse}</p>
              <p className="mt-1 text-xs leading-snug text-slate-600">Cases under response</p>
            </div>
            <div>
              <p className="mono text-2xl text-slate-900">{stats.availableVolunteers ?? '—'}</p>
              <p className="mt-1 text-xs leading-snug text-slate-600">Available volunteers</p>
            </div>
            <div>
              <p className="mono text-2xl text-slate-900">{stats.districtsCovered}</p>
              <p className="mt-1 text-xs leading-snug text-slate-600">Districts covered</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/50 bg-white/50 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <p className="text-sm font-medium text-slate-900">Find accidents near you</p>
          <p className="mt-1 text-xs text-slate-600">Narrow by division, district and area.</p>

          <div className="mt-5 space-y-3">
            <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700">
              <option>Division</option>
              <option>Chattogram</option>
              <option>Dhaka</option>
              <option>Khulna</option>
            </select>
            <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700">
              <option>District</option>
            </select>
            <select className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700">
              <option>Area</option>
            </select>
            <a href="/accidents" className="block w-full rounded-xl bg-slate-900 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-slate-800">
              Search
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
