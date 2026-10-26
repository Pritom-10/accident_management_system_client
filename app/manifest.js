export default function manifest() {
  return {
    id: '/',
    name: 'Sahayota: Accident & Emergency Response',
    short_name: 'Sahayota',
    description: 'Accident news, SOS, blood donors and treatment fundraising for Bangladesh.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F4F6FB',
    theme_color: '#F4F6FB',
    categories: ['health', 'medical', 'news'],
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512?m=1', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Send an SOS', short_name: 'SOS', url: '/sos', icons: [{ src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' }] },
      { name: 'First aid guide', short_name: 'First aid', url: '/first-aid', icons: [{ src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' }] },
      { name: 'Report an accident', short_name: 'Report', url: '/report', icons: [{ src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' }] },
      { name: 'Blood requests', short_name: 'Blood', url: '/blood', icons: [{ src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' }] },
    ],
  };
}