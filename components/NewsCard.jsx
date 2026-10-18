import Link from 'next/link';
import { BadgeCheck, MapPin, Clock } from 'lucide-react';
import { imageSrc } from '../lib/imageUrl';
import { formatDateTime, vehicleLabel } from '../lib/newsOptions';

export default function NewsCard({ post }) {
  const photo = post.photos?.[0];

  return (
    <Link
      href={`/news/${post._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/50 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      {photo && (
        <div className="h-40 w-full overflow-hidden">
          <img
            src={imageSrc(photo)}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.isVerified ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <BadgeCheck size={13} /> Verified
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Unverified</span>
          )}
          {post.deaths > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">{post.deaths} dead</span>
          )}
          {post.injured > 0 && (
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-700">{post.injured} injured</span>
          )}
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{post.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{post.body}</p>

        {post.vehicleTypes?.length > 0 && (
          <p className="text-xs text-slate-500">{post.vehicleTypes.map(vehicleLabel).join(', ')}</p>
        )}

        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} />
            {[post.location?.area, post.location?.district].filter(Boolean).join(', ')}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {formatDateTime(post.occurredAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}