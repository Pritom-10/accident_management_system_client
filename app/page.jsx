import HomeHero from '../components/home/HomeHero';
import Ticker from '../components/home/Ticker';
import StatsBand from '../components/home/StatsBand';
import Rail from '../components/home/Rail';
import LiveMap from '../components/home/LiveMap';
import HowItWorks from '../components/home/HowItWorks';
import HospitalStrip from '../components/home/HospitalStrip';
import VolunteerBand from '../components/home/VolunteerBand';
import EmergencyBand from '../components/home/EmergencyBand';
import BloodRequestCard from '../components/blood/BloodRequestCard';
import CampaignCard from '../components/donate/CampaignCard';
import NewsCard from '../components/NewsCard';
import AccidentCard from '../components/AccidentCard';
import { API_BASE } from '../lib/api';

async function getJson(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [accidents, pins, hospitals, news, blood, campaigns, bloodStats, donateStats] = await Promise.all([
    getJson('/accidents', []),
    getJson('/accidents/map', []),
    getJson('/hospitals', []),
    getJson('/news?limit=6', { items: [] }),
    getJson('/blood/requests?limit=6', { items: [] }),
    getJson('/donate/campaigns?limit=6', { items: [] }),
    getJson('/blood/stats', null),
    getJson('/donate/stats', null),
  ]);

  const underResponse = accidents.filter((a) => a.status === 'rescue_in_progress');
  const stats = {
    solved: accidents.filter((a) => a.status === 'cleared').length,
    bloodOpen: bloodStats?.openRequests ?? 0,
    donors: bloodStats?.donors ?? 0,
    raised: donateStats?.raised ?? 0,
  };
  const counts = {
    bloodOpen: stats.bloodOpen,
    campaigns: donateStats?.activeCampaigns ?? 0,
    pins: pins.length,
    hospitals: hospitals.filter((h) => !h.isPinned).length,
  };

  return (
    <main>
      <HomeHero liveCount={underResponse.length} counts={counts} />
      <Ticker accidents={accidents} />
      <StatsBand stats={stats} />

      <Rail
        id="blood"
        icon="droplet"
        title="Blood needed now"
        subtitle="The most urgent requests. One donor can make the difference."
        href="/blood"
        emptyText="No one needs blood right now"
        emptyHref="/blood/donor"
        emptyLabel="Become a donor"
      >
        {(blood.items || []).map((r, i) => (
          <BloodRequestCard key={r._id} request={r} index={i} />
        ))}
      </Rail>

      <LiveMap pins={pins} />

      <Rail
        id="news"
        icon="news"
        title="Latest accident news"
        subtitle="Stories from our admins and journalists."
        href="/news"
        emptyText="No news yet"
      >
        {(news.items || []).map((p) => (
          <NewsCard key={p._id} post={p} />
        ))}
      </Rail>

      <Rail
        id="donate"
        icon="donate"
        title="Help a family heal"
        subtitle="Checked campaigns. Every donation and every bill is public."
        href="/donate"
        emptyText="No open campaign right now"
        emptyHref="/donate/start"
        emptyLabel="Start a campaign"
      >
        {(campaigns.items || []).map((c, i) => (
          <CampaignCard key={c._id} campaign={c} index={i} />
        ))}
      </Rail>

      <HowItWorks />

      <Rail
        id="accidents"
        icon="accident"
        title="Recent verified cases"
        subtitle="Each one was checked by an admin."
        href="/accidents"
        emptyText="No verified cases yet"
        emptyHref="/report"
        emptyLabel="Report an emergency"
      >
        {accidents.slice(0, 8).map((a) => (
          <AccidentCard key={a.caseId} accident={a} />
        ))}
      </Rail>

      <HospitalStrip hospitals={hospitals} />
      <VolunteerBand />
      <EmergencyBand />
    </main>
  );
}