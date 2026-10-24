import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { imageSrc } from '../lib/imageUrl';
import { formatDateTime } from '../lib/newsOptions';

const statusMap = {
  rescue_in_progress: { label: 'Rescue in progress', chip: 'bg-rose-600 text-white', live: true },
  cleared: { label: 'Cleared', chip: 'bg-emerald-600 text-white', live: false },
};

export default function AccidentCard({ accident }) {
  const status = statusMap[accident.status] ?? statusMap.cleared;
  const place = [accident.location?.area, accident.location?.district].filter(Boolean).join(', ');

  return (
    <Link
      href={`/accidents/${accident.caseId}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/10"
    >
      <div className="relative h-44 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FECDD3, #C7D2FE)' }}>
        {accident.photoUrl && (
          <img
            src={imageSrc(accident.photoUrl)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        <span className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-lg ${status.chip}`}>
          <span className="relative flex h-1.5 w-1.5">
            {status.live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          {status.label}
        </span>

        <h3 className="absolute inset-x-4 bottom-3 line-clamp-1 text-lg font-semibold text-white drop-shadow">{accident.accidentType}</h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{accident.description}</p>

        <div className="mt-auto space-y-1.5 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
          <p className="flex items-center gap-1.5"><MapPin size={13} /> {place || 'Place not given'}</p>
          <p className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5"><Clock size={13} /> {formatDateTime(accident.dateTime)}</span>
            <span className="mono text-[11px] text-slate-400">{accident.caseId}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}