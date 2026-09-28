import Link from 'next/link';
import { Car, Flame, Waves, AlertTriangle, MapPin, Clock } from 'lucide-react';

const statusMap = {
  rescue_in_progress: { label: 'Rescue in progress', color: 'text-rose-600', dot: 'bg-rose-600', border: '#E11D48' },
  cleared: { label: 'Cleared', color: 'text-emerald-600', dot: 'bg-emerald-600', border: '#059669' },
};

function typeIcon(type = '') {
  const t = type.toLowerCase();
  if (t.includes('road') || t.includes('car') || t.includes('vehicle')) return Car;
  if (t.includes('fire')) return Flame;
  if (t.includes('drown') || t.includes('water')) return Waves;
  return AlertTriangle;
}

export default function AccidentCard({ accident }) {
  const status = statusMap[accident.status] ?? statusMap.cleared;
  const Icon = typeIcon(accident.accidentType);
  const time = accident.dateTime
    ? new Date(accident.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Link
      href={`/accidents/${accident.caseId}`}
      className="group flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-white/50 bg-white/50 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ borderLeft: `3px solid ${status.border}` }}
    >
      {accident.photoUrl && (
        <div className="-mx-5 -mt-5 h-36 w-[calc(100%+2.5rem)] overflow-hidden">
          <img
            src={accident.photoUrl}
            alt={accident.accidentType}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-slate-700">
            <Icon size={18} />
          </span>
          <div>
            <h3 className="text-base font-semibold leading-tight text-slate-900">{accident.accidentType}</h3>
            <p className="mono text-[11px] text-slate-600">{accident.caseId}</p>
          </div>
        </div>
      </div>

      <span className={`flex w-fit items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium ${status.color}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </span>

      <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{accident.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs text-slate-600">
        <span className="flex items-center gap-1"><MapPin size={13} />{accident.location?.area}, {accident.location?.district}</span>
        <span className="mono flex items-center gap-1"><Clock size={13} />{time}</span>
      </div>
    </Link>
  );
}
