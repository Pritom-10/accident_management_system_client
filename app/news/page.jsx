import { Newspaper } from 'lucide-react';
import NewsCard from '../../components/NewsCard';
import NewsFeatured from '../../components/NewsFeatured';
import NewsFilters from '../../components/NewsFilters';
import Pagination from '../../components/Pagination';
import WriteNewsLinks from '../../components/WriteNewsLinks';
import Reveal from '../../components/Reveal';
import { PageHero, glass } from '../../components/ui/kit';
import { API_BASE } from '../../lib/api';

const PAGE_SIZE = 9;
const FILTER_KEYS = ['q', 'division', 'district', 'area', 'vehicle', 'verified'];

export const metadata = { title: 'Accident news | ResQ' };

async function getNews(params) {
  try {
    const qs = new URLSearchParams({ ...params, limit: String(PAGE_SIZE) }).toString();
    const res = await fetch(`${API_BASE}/news?${qs}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function NewsPage({ searchParams }) {
  const sp = (await searchParams) || {};

  const filters = {};
  for (const k of FILTER_KEYS) {
    if (typeof sp[k] === 'string' && sp[k]) filters[k] = sp[k];
  }
  const requestedPage = typeof sp.page === 'string' ? sp.page : '1';

  const data = await getNews({ ...filters, page: requestedPage });
  const hasFilters = Object.keys(filters).length > 0;

  const showFeatured = data && data.page === 1 && !hasFilters && data.items.length >= 3;
  const featured = showFeatured ? data.items[0] : null;
  const rest = data ? (showFeatured ? data.items.slice(1) : data.items) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <PageHero
        icon={<Newspaper size={24} />}
        tone="indigo"
        eyebrow="Stories you can trust"
        title="Accident news"
        subtitle="Posted by our admins and journalists. Each story shows whether it has been verified."
        actions={<WriteNewsLinks />}
        aside={
          data && (
            <div className="rounded-2xl border border-white/70 bg-white/70 px-5 py-3 backdrop-blur-xl">
              <p className="mono text-2xl text-slate-900">{data.total}</p>
              <p className="text-xs text-slate-600">{hasFilters ? 'Matching stories' : 'Stories'}</p>
            </div>
          )
        }
      />

      <div className="mt-6">
        <NewsFilters key={JSON.stringify(filters)} initial={filters} />
      </div>

      {data === null ? (
        <div className={`${glass} mt-8 p-10 text-center text-sm text-slate-600`}>
          Could not load the news. Please try again in a moment.
        </div>
      ) : (
        <>
          <p className="mt-8 text-sm text-slate-600">
            {data.total} {data.total === 1 ? 'story' : 'stories'}
            {hasFilters ? ' match your search' : ''}
            {data.pages > 1 ? ` · page ${data.page} of ${data.pages}` : ''}
          </p>

          {data.items.length === 0 ? (
            <div className={`${glass} mt-4 p-10 text-center text-sm text-slate-600`}>
              {hasFilters ? 'No news matches this search. Try fewer filters.' : 'No news has been posted yet.'}
            </div>
          ) : (
            <>
              {featured && (
                <Reveal className="mt-4">
                  <NewsFeatured post={featured} />
                </Reveal>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <Reveal key={p._id} delay={(i % 3) * 0.07} className="h-full">
                    <NewsCard post={p} />
                  </Reveal>
                ))}
              </div>
            </>
          )}

          <Pagination basePath="/news" params={filters} page={data.page} pages={data.pages} />
        </>
      )}
    </main>
  );
}