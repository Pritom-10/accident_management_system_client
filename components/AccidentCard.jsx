const statusMap = {
  rescue_in_progress: { label: 'Rescue in progress', color: 'text-rose-600', dot: 'bg-rose-600', border: '#E11D48' },
  cleared: { label: 'Cleared', color: 'text-emerald-600', dot: 'bg-emerald-600', border: '#059669' },
};

export default function AccidentCard({ accident }) {
  const status = statusMap[accident.status] ?? statusMap.cleared;
  const time = accident.dateTime
    ? new Date(accident.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <a
      href={`/accidents/${accident.caseId}`}
      className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-transform hover:-translate-y-0.5"
      style={{ borderLeft: `3px solid ${status.border}` }}
    >
      {accident.photoUrl && (
        <img
          src={accident.photoUrl}
          alt={accident.accidentType}
          className="-mx-5 -mt-5 h-36 w-[calc(100%+2.5rem)] object-cover"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mono text-xs text-slate-600">{accident.caseId}</p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{accident.accidentType}</h3>
        </div>
        <span className={`flex items-center gap-1.5 whitespace-nowrap text-xs ${status.color}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{accident.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs text-slate-600">
        <span>{accident.location?.area}, {accident.location?.district}</span>
        <span className="mono">{time}</span>
      </div>
    </a>
  );
}
