import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { imageSrc } from '../lib/imageUrl';

const statusMap = {
  rescue_in_progress: { label: 'Rescue in progress', color: 'text-rose-600', dot: 'bg-rose-600', border: '#E11D48' },
  cleared: { label: 'Cleared', color: 'text-emerald-600', dot: 'bg-emerald-600', border: '#059669' },
};

export default function AccidentCard({ accident }) {
  const status = statusMap[accident.status] ?? statusMap.cleared;
  const time = accident.dateTime
      ? new Date(accident.dateTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka' })
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
            src={imageSrc(accident.photoUrl)}
            alt={accident.accidentType}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold leading-tight text-slate-900">{accident.accidentType}</h3>
        <p className="mono mt-1 text-[11px] text-slate-600">{accident.caseId}</p>
      </div>

      <span className={`flex w-fit items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium ${status.color}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
        {status.label}
      </span>

      <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{accident.description}</p>

      <div className="mt-auto flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs text-slate-600">
       <span className="flex items-center gap-1"><MapPin size={13} />{[accident.location?.area, accident.location?.district].filter(Boolean).join(', ')}</span>
        <span className="mono flex items-center gap-1"><Clock size={13} />{time}</span>
      </div>
    </Link>
  );
}