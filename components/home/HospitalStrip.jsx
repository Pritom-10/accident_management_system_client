import Link from 'next/link';
import { Ambulance, BedDouble, Building2, Flame, Phone, ShieldAlert, Siren } from 'lucide-react';
import Rail from './Rail';

const typeIcon = {
  hospital: Building2,
  fire_service: Flame,
  police: ShieldAlert,
  ambulance: Ambulance,
  other: Siren,
};

const typeLabel = {
  hospital: 'Hospital',
  fire_service: 'Fire service',
  police: 'Police',
  ambulance: 'Ambulance',
  other: 'Emergency',
};

function Emergency999() {
  return (
    <div className="relative flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-rose-700 p-5 text-white shadow-lg shadow-rose-600/25">
      <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-ping rounded-full bg-white/10" />
      <div className="relative">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
          <Siren size={20} />
        </span>
        <p className="mt-4 text-lg font-semibold">National emergency</p>
        <p className="text-sm text-rose-100">Police, fire and ambulance. Free, all day.</p>
      </div>
      <a
        href="tel:999"
        className="relative mt-4 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-base font-semibold text-rose-600 transition-transform hover:scale-[1.03]"
      >
        <Phone size={16} /> 999
      </a>
    </div>
  );
}

function HospitalCard({ h }) {
  const Icon = typeIcon[h.type] || Building2;
  const count = h.patientCount ?? 0;

  return (
    <div className="flex h-full min-h-[13rem] flex-col gap-4 rounded-3xl border border-white/60 bg-white/60 p-5 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{h.name}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">
            {typeLabel[h.type] || h.type}
            {h.address && h.address !== 'Nationwide' ? ` · ${h.address}` : ''}
          </p>
        </div>
      </div>

      {h.type === 'hospital' && (
        <p
          className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            count > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-white/80 text-slate-600'
          }`}
        >
          <BedDouble size={13} /> {count > 0 ? `${count} ${count === 1 ? 'patient' : 'patients'} admitted` : 'No patients reported'}
        </p>
      )}

      <a
        href={`tel:${h.phone}`}
        className="mt-auto flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        <Phone size={15} /> {h.phone}
      </a>
    </div>
  );
}

export default function HospitalStrip({ hospitals = [] }) {
  const list = hospitals.filter((h) => !h.isPinned).slice(0, 8);

  return (
    <Rail
      id="hospitals"
      icon="hospital"
      title="Hospitals and emergency numbers"
      subtitle="Tap a number to call. Admitted patient counts come from volunteers."
      href="/hospitals"
    >
      <Emergency999 key="999" />
      {list.map((h) => (
        <HospitalCard key={h._id} h={h} />
      ))}
    </Rail>
  );
}