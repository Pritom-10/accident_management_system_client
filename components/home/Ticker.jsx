import Link from 'next/link';
import { formatDateTime } from '../../lib/newsOptions';

const fallback = [
  'National emergency: call 999',
  'Report an accident in under a minute',
  'Every report is checked by an admin',
  'Donate blood, save a life',
  'Every donation and every bill is public',
];

export default function Ticker({ accidents = [] }) {
  const live = accidents.slice(0, 8).map((a) => ({
    key: a.caseId,
    href: `/accidents/${a.caseId}`,
    live: a.status === 'rescue_in_progress',
    text: `${a.accidentType} · ${[a.location?.area, a.location?.district].filter(Boolean).join(', ')} · ${formatDateTime(a.dateTime)}`,
  }));

  const items = live.length > 0 ? live : fallback.map((t) => ({ key: t, text: t, live: false }));
  const loop = [...items, ...items];

  return (
    <div className="marquee relative overflow-hidden bg-slate-950 py-3.5 text-sm text-slate-200 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="marquee-track">
        {loop.map((item, i) => {
          const inner = (
            <>
              <span className="relative flex h-2 w-2">
                {item.live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${item.live ? 'bg-rose-500' : 'bg-slate-500'}`} />
              </span>
              {item.text}
            </>
          );

          return item.href ? (
            <Link key={`${item.key}-${i}`} href={item.href} className="mx-7 inline-flex items-center gap-2.5 whitespace-nowrap hover:text-white">
              {inner}
            </Link>
          ) : (
            <span key={`${item.key}-${i}`} className="mx-7 inline-flex items-center gap-2.5 whitespace-nowrap">
              {inner}
            </span>
          );
        })}
      </div>
    </div>
  );
}