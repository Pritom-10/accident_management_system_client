export const VEHICLES = [
  { value: 'bus', label: 'Bus' },
  { value: 'truck', label: 'Truck' },
  { value: 'car', label: 'Car' },
  { value: 'microbus', label: 'Microbus' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'cng', label: 'CNG / Auto-rickshaw' },
  { value: 'rickshaw', label: 'Rickshaw' },
  { value: 'pickup', label: 'Pickup / Van' },
  { value: 'train', label: 'Train' },
  { value: 'boat', label: 'Boat / Launch' },
  { value: 'other', label: 'Other' },
];

export const vehicleLabel = (v) => VEHICLES.find((x) => x.value === v)?.label || v;


export function formatDateTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dhaka' });
}

export function youtubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    let id = null;
    if (host === 'youtu.be') id = u.pathname.slice(1);
    else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') id = u.searchParams.get('v');
      else if (u.pathname.startsWith('/embed/') || u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2];
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}