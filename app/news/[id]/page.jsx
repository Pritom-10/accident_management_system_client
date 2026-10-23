import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, MapPin, Clock, ExternalLink, Route, Car } from 'lucide-react';
import { API_BASE } from '../../../lib/api';
import { imageSrc } from '../../../lib/imageUrl';
import { formatDateTime, vehicleLabel, youtubeId } from '../../../lib/newsOptions';

async function getPost(id) {
  try {
    const res = await fetch(`${API_BASE}/news/${id}`, { cache: 'no-store' });
    if (res.status === 404) return 'missing';
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function NewsDetailPage({ params }) {
  const { id } = await params;
  const post = await getPost(id);

  if (post === 'missing') notFound();

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-slate-600">
        Could not load this story. Please try again in a moment.
      </main>
    );
  }

  const photos = post.photos || [];
  const vid = youtubeId(post.videoUrl);
  const place = [post.location?.address, post.location?.area, post.location?.district, post.location?.division]
    .filter(Boolean)
    .join(', ');

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/news" className="flex w-fit items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> All news
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {post.isVerified ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            <BadgeCheck size={14} /> Verified
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            Unverified: this report has not been confirmed yet
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900">{post.title}</h1>

      <div className="mt-4 flex flex-col gap-1.5 text-sm text-slate-600">
        <span className="flex items-center gap-2"><Clock size={15} /> {formatDateTime(post.occurredAt)}</span>
        <span className="flex items-center gap-2"><MapPin size={15} /> {place}</span>
        {post.road && <span className="flex items-center gap-2"><Route size={15} /> {post.road}</span>}
        {post.vehicleTypes?.length > 0 && (
          <span className="flex items-center gap-2"><Car size={15} /> {post.vehicleTypes.map(vehicleLabel).join(', ')}</span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-xl">
          <p className="mono text-2xl text-rose-600">{post.deaths}</p>
          <p className="mt-1 text-xs text-slate-600">Dead</p>
        </div>
        <div className="rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-xl">
          <p className="mono text-2xl text-slate-900">{post.injured}</p>
          <p className="mt-1 text-xs text-slate-600">Injured</p>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="mt-6">
          <img
            src={imageSrc(photos[0])}
            alt=""
            className="max-h-[28rem] w-full rounded-2xl border border-white/50 object-cover"
          />
          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {photos.slice(1).map((p) => (
                <a key={p} href={imageSrc(p)} target="_blank" rel="noopener noreferrer">
                  <img src={imageSrc(p)} alt="" className="h-24 w-full rounded-xl border border-white/50 object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}


      <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-slate-700">{post.body}</div>

      {vid ? (
        <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-white/50">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${vid}`}
            title="Video"
            loading="lazy"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : (
        post.videoUrl && (
          <a
            href={post.videoUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-6 flex w-fit items-center gap-2 rounded-full border border-slate-300/70 bg-white/70 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
          >
            <ExternalLink size={16} /> Watch the video
          </a>
        )
      )}

      <div className="mt-8 rounded-2xl border border-white/50 bg-white/40 p-4 text-sm text-slate-600 backdrop-blur-xl">
        <p>
          Source:{' '}
          {post.sourceUrl ? (
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-indigo-600 hover:underline"
            >
              {post.sourceName || post.sourceUrl}
            </a>
          ) : (
            <span className="font-medium text-slate-900">{post.sourceName || 'Not given'}</span>
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Posted by {post.authorName || 'ResQ'} on {formatDateTime(post.publishedAt || post.createdAt)}
        </p>
      </div>
    </main>
  );
}