import Link from 'next/link';
import { BadgeCheck, Clock, History, MapPin } from 'lucide-react';
import { imageSrc } from '../lib/imageUrl';
import { formatDateTime, vehicleLabel } from '../lib/newsOptions';


export default function NewsCard({ post }) {
  const photo = post.photos?.[0];
  const place = [post.location?.area, post.location?.district].filter(Boolean).join(', ');

  return (
    <Link
      href={`/news/${post._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-900/10"
    >
      <div className="relative h-44 overflow-hidden" style={{ background: 'linear-gradient(135deg, #C7D2FE, #FBCFE8)' }}>
        {photo && (
          <img src={imageSrc(photo)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        )}
               {post.updateCount > 0 && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
            <History size={12} /> {post.updateCount} {post.updateCount === 1 ? 'update' : 'updates'}
          </span>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {post.isVerified ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white shadow-lg">
              <BadgeCheck size={13} /> Verified
            </span>
          ) : (
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white shadow-lg">Unverified</span>
          )}
        </div>

        {(post.deaths > 0 || post.injured > 0) && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {post.deaths > 0 && <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-medium text-white">{post.deaths} dead</span>}
            {post.injured > 0 && <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">{post.injured} injured</span>}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{post.title}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{post.body}</p>

        {post.vehicleTypes?.length > 0 && (
          <p className="text-xs text-slate-500">{post.vehicleTypes.map(vehicleLabel).join(', ')}</p>
        )}

        <div className="mt-auto space-y-1.5 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
          <p className="flex items-center gap-1.5"><MapPin size={13} /> {place}</p>
          <p className="flex items-center gap-1.5"><Clock size={13} /> {formatDateTime(post.occurredAt)}</p>
        </div>
      </div>
    </Link>
  );
}