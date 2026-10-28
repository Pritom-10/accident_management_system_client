import { API_BASE } from '../../../lib/api';
import { imageSrc } from '../../../lib/imageUrl';
import { percent, taka } from '../../../lib/money';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE}/donate/campaigns/${id}`, { cache: 'no-store' });
    if (!res.ok) return {};
    const c = await res.json();
    if (!['active', 'completed', 'closed'].includes(c.status)) return {};

    const title = `${c.title} | Sahayota`;
    const description = `${taka(c.raised)} raised of ${taka(c.targetAmount)} (${percent(c.raised, c.targetAmount)}%) for ${c.patientName} at ${c.hospital?.name}. Every donation and bill is public.`;
    const image = c.photos && c.photos[0] ? [imageSrc(c.photos[0])] : undefined;

    return {
      title,
      description,
      openGraph: { title, description, type: 'article', images: image },
      twitter: { card: image ? 'summary_large_image' : 'summary', title, description },
    };
  } catch {
    return {};
  }
}

export default function CampaignLayout({ children }) {
  return children;
}