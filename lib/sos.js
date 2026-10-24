import { osmLink } from './geo';

export const SOS_KEY = 'ResQ_sos';
const SIX_HOURS = 6 * 60 * 60 * 1000;

export function saveSos(token) {
  try {
    localStorage.setItem(SOS_KEY, JSON.stringify({ token, at: Date.now() }));
  } catch {
    return;
  }
}

export function readSos() {
  try {
    const v = JSON.parse(localStorage.getItem(SOS_KEY));
    if (v && v.token && Date.now() - v.at < SIX_HOURS) return v.token;
  } catch {
    return null;
  }
  return null;
}

export function clearSos() {
  try {
    localStorage.removeItem(SOS_KEY);
  } catch {
    return;
  }
}

export const km = (n) => (n < 1 ? `${Math.max(1, Math.round(n * 1000))} m` : `${n.toFixed(1)} km`);

export function timeAgo(date, now = Date.now()) {
  const s = Math.max(0, Math.round((now - new Date(date).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
}

export const shareMessage = (lat, lng) => `I need help. My location: ${osmLink(lat, lng)}`;
export const whatsappShare = (text) => `https://wa.me/?text=${encodeURIComponent(text)}`;
export const smsShare = (text) => `sms:?&body=${encodeURIComponent(text)}`;