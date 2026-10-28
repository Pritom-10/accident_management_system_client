import { API_BASE } from '../../../../lib/api';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${API_BASE}/blood/requests/${id}`, { cache: 'no-store' });
    if (!res.ok) return {};
    const r = await res.json();

    const title = `${r.bloodGroup} blood needed at ${r.hospital?.name} | Sahayota`;
    const description = `${r.unitsNeeded} ${r.unitsNeeded === 1 ? 'bag' : 'bags'} of ${r.bloodGroup} blood needed in ${[r.location?.area, r.location?.district].filter(Boolean).join(', ')}. Can you help?`;

    return {
      title,
      description,
      openGraph: { title, description, type: 'article' },
      twitter: { card: 'summary', title, description },
    };
  } catch {
    return {};
  }
}

export default function BloodRequestLayout({ children }) {
  return children;
}