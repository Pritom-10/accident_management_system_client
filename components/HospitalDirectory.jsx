export default function HospitalDirectory({ hospitals = [] }) {
  return (
    <section id="hospitals" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold text-slate-900">Hospitals &amp; emergency contacts</h2>
      <p className="mt-1 text-sm text-slate-500">Tap a number to call directly.</p>

      {hospitals.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-500 backdrop-blur-xl">
          No hospitals added yet.
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/50 bg-white/50 backdrop-blur-xl">
          {hospitals.map((h, i) => (
            <div
              key={h._id}
              className={`flex items-center justify-between px-5 py-4 ${i !== 0 ? 'border-t border-slate-200/70' : ''} ${h.isPinned ? 'bg-rose-50/60' : ''}`}
            >
              <div>
                <p className={`text-sm font-medium ${h.isPinned ? 'text-rose-600' : 'text-slate-900'}`}>{h.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{h.type}</p>
              </div>
              <a
                href={`tel:${h.phone}`}
                className={`mono text-sm ${h.isPinned ? 'text-rose-600' : 'text-slate-900'} hover:underline`}
              >
                {h.phone}
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
