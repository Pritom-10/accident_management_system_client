import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, ExternalLink, MapPin, Phone } from 'lucide-react';
import MapView from '../../../components/map/MapView';
import FlagButton from '../../../components/FlagButton';
import ZoomImage from '../../../components/ui/ZoomImage';
import ShareButton from '../../../components/ui/ShareButton';
import { glass } from '../../../components/ui/kit';
import { API_BASE } from '../../../lib/api';
import { imageSrc } from '../../../lib/imageUrl';
import { osmLink } from '../../../lib/geo';
import { formatDateTime } from '../../../lib/newsOptions';

const statusStyle = {
  rescue_in_progress: { label: 'Rescue in progress', classes: 'bg-rose-600 text-white', live: true },
  cleared: { label: 'Cleared', classes: 'bg-emerald-600 text-white', live: false },
};

async function getCase(caseId) {
  try {
    const res = await fetch(`${API_BASE}/accidents/${encodeURIComponent(caseId)}`, { cache: 'no-store' });
    if (res.status === 404) return 'missing';
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AccidentDetailPage({ params }) {
  const { caseId } = await params;
  const item = await getCase(caseId);

  if (item === 'missing') notFound();

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-slate-600">
        Could not load this case. Please try again in a moment.
      </main>
    );
  }

  const loc = item.location || {};
  const hasPin = typeof loc.lat === 'number' && typeof loc.lng === 'number';
  const status = statusStyle[item.status] || statusStyle.cleared;
  const place = [loc.address, loc.area, loc.district, loc.division].filter(Boolean).join(', ');

  const markers = hasPin
    ? [{
        id: item.caseId,
        lat: loc.lat,
        lng: loc.lng,
        status: item.status,
        title: item.accidentType,
        subtitle: [loc.area, loc.district].filter(Boolean).join(', '),
      }]
    : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link href="/accidents" className="flex w-fit items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> All accidents
      </Link>

      <div
        className="relative mt-4 h-72 overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 md:h-[26rem]"
        style={{ background: 'linear-gradient(135deg, #E11D48, #4F46E5)' }}
      >
        {item.photoUrl && <ZoomImage src={imageSrc(item.photoUrl)} className="absolute inset-0 h-full w-full" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}>
            <span className="relative flex h-1.5 w-1.5">
              {status.live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            {status.label}
          </span>
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">{item.accidentType}</h1>
          <p className="mono mt-2 text-xs text-white/70">{item.caseId}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={`${glass} flex items-start gap-3 p-5`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"><Clock size={18} /></span>
          <div>
            <p className="text-xs text-slate-500">When</p>
            <p className="text-sm font-medium text-slate-900">{formatDateTime(item.dateTime)}</p>
          </div>
        </div>
        <div className={`${glass} flex items-start gap-3 p-5`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><MapPin size={18} /></span>
          <div>
            <p className="text-xs text-slate-500">Where</p>
            <p className="text-sm font-medium text-slate-900">{place}</p>
          </div>
        </div>
      </div>

      <div className={`${glass} mt-4 p-6 md:p-8`}>
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">{item.description}</p>
      </div>

      {hasPin && (
        <div className={`${glass} mt-4 p-2`}>
          <MapView markers={markers} height={320} />
          <div className="px-4 py-3">
            <a href={osmLink(loc.lat, loc.lng)} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline">
              <ExternalLink size={13} /> Open in OpenStreetMap
            </a>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ShareButton title={item.accidentType} text={`Accident case ${item.caseId} on Sahayota`}>Share this case</ShareButton>
        <a href="tel:999" className="flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
          <Phone size={16} /> Call 999
        </a>
      </div>

      <div className={`${glass} mt-8 p-5`}>
        <p className="mb-3 text-xs text-slate-600">Something looks wrong with this report?</p>
        <FlagButton caseId={item.caseId} />
      </div>
    </main>
  );
}