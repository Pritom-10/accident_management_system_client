export default function MissingPersons({ people = [] }) {
  return (
    <section id="missing" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold text-slate-900">Missing persons</h2>
      <p className="mt-1 text-sm text-slate-500">Approved reports, searchable by name, age and last-known location.</p>

      {people.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-500 backdrop-blur-xl">
          No approved missing person reports right now.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {people.map((p) => (
            <div key={p._id} className="rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl">
              <div
                className="mb-4 aspect-4/3 w-full rounded-xl border border-slate-200/70 bg-slate-100 bg-cover bg-center"
                style={p.photoUrl ? { backgroundImage: `url(${p.photoUrl})` } : undefined}
              />
              <p className="text-sm font-medium text-slate-900">{p.name}, {p.age}</p>
              <p className="mt-1 text-xs text-slate-500">
                Last seen: {p.lastKnownLocation?.area}, {p.lastKnownLocation?.district}
              </p>
              <p className="mono mt-0.5 text-xs text-slate-500">
                {p.lastSeenDateTime ? new Date(p.lastSeenDateTime).toLocaleDateString() : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
