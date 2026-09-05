import AccidentCard from './AccidentCard';

export default function AccidentGrid({ accidents = [] }) {
  return (
    <section id="accidents" className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Verified accidents</h2>
          <p className="mt-1 text-sm text-slate-500">Confirmed by the administrator, most recent first.</p>
        </div>
        <a href="/accidents" className="text-sm text-slate-700 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-700">
          View all
        </a>
      </div>

      {accidents.length === 0 ? (
        <div className="rounded-2xl border border-white/50 bg-white/40 p-10 text-center text-sm text-slate-500 backdrop-blur-xl">
          No verified accidents right now.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {accidents.map((a) => (
            <AccidentCard key={a.caseId || a._id} accident={a} />
          ))}
        </div>
      )}
    </section>
  );
}
