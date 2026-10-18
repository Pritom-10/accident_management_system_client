import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, ExternalLink } from 'lucide-react';
import MapView from '../../../components/map/MapView';
import FlagButton from '../../../components/FlagButton';
import { API_BASE } from '../../../lib/api';
import { imageSrc } from '../../../lib/imageUrl';
import { osmLink } from '../../../lib/geo';
import { formatDateTime } from '../../../lib/newsOptions';

const statusStyle = {
  rescue_in_progress: { label: 'Rescue in progress', classes: 'bg-rose-100 text-rose-700' },
  cleared: { label: 'Cleared', classes: 'bg-emerald-100 text-emerald-700' },
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
    ? [
        {
          id: item.caseId,
          lat: loc.lat,
          lng: loc.lng,
          status: item.status,
          title: item.accidentType,
          subtitle: [loc.area, loc.district].filter(Boolean).join(', '),
        },
      ]
    : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/accidents" className="flex w-fit items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> All accidents
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.classes}`}>{status.label}</span>
        <span className="mono text-xs text-slate-500">{item.caseId}</span>
      </div>

      <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">{item.accidentType}</h1>

      <div className="mt-4 flex flex-col gap-1.5 text-sm text-slate-600">
        <span className="flex items-center gap-2"><Clock size={15} /> {formatDateTime(item.dateTime)}</span>
        <span className="flex items-center gap-2"><MapPin size={15} /> {place}</span>
      </div>

      {item.photoUrl && (
        <img
          src={imageSrc(item.photoUrl)}
          alt=""
          className="mt-6 max-h-[28rem] w-full rounded-2xl border border-white/50 object-cover"
        />
      )}

      <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-slate-700">{item.description}</p>

      {hasPin && (
        <div className="mt-6">
          <MapView markers={markers} height={320} />
          <a
            href={osmLink(loc.lat, loc.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-fit items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
          >
            <ExternalLink size={13} /> Open in OpenStreetMap
          </a>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/50 bg-white/40 p-4 backdrop-blur-xl">
        <p className="mb-3 text-xs text-slate-600">Something looks wrong with this report?</p>
        <FlagButton caseId={item.caseId} />
      </div>
    </main>
  );
}