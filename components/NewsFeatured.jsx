import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Clock, MapPin } from 'lucide-react';
import { imageSrc } from '../lib/imageUrl';
import { formatDateTime } from '../lib/newsOptions';

export default function NewsFeatured({ post }) {
  const photo = post.photos?.[0];
  const place = [post.location?.area, post.location?.district].filter(Boolean).join(', ');

  return (
    <Link
      href={`/news/${post._id}`}
      className="group relative block h-[22rem] overflow-hidden rounded-[2rem] shadow-xl shadow-slate-900/10 md:h-[28rem]"
      style={{ background: 'linear-gradient(135deg, #312E81, #BE123C)' }}
    >
      {photo && (
        <img src={imageSrc(photo)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">Latest</span>
          {post.isVerified && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium">
              <BadgeCheck size={13} /> Verified
            </span>
          )}
          {post.deaths > 0 && <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-medium">{post.deaths} dead</span>}
          {post.injured > 0 && <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-800">{post.injured} injured</span>}
        </div>

        <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-tight md:text-4xl">{post.title}</h2>
        <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-slate-200">{post.body}</p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5"><MapPin size={13} /> {place}</span>
            <span className="flex items-center gap-1.5"><Clock size={13} /> {formatDateTime(post.occurredAt)}</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors group-hover:bg-white/25">
            Read the story <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}