import { API_BASE, apiFetch } from './api';
import { registerSW } from './sw';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

function keyToBytes(base64) {
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function readyRegistration() {
  const reg = await registerSW();
  if (!reg) throw new Error('Could not start the background service on this device.');
  return reg;
}

export async function currentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration('/');
  return reg ? reg.pushManager.getSubscription() : null;
}

export async function saveSubscription(subscription, extra = {}) {
  const res = await apiFetch(`${API_BASE}/notifications/subscribe`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ subscription: subscription.toJSON(), ...extra }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not save your alert settings');
  return data;
}

export async function enablePush(extra = {}) {
  if (!pushSupported()) throw new Error('This browser cannot receive push alerts.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Alerts are blocked for this site. Allow them in your browser settings.'
        : 'Permission was not given.'
    );
  }

  const keyRes = await fetch(`${API_BASE}/notifications/public-key`);
  const { key } = await keyRes.json().catch(() => ({}));
  if (!key) throw new Error('Alerts are not set up on the server yet.');

  const reg = await readyRegistration();
  let subscription = await reg.pushManager.getSubscription();

  if (!subscription) {
    try {
      subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(key) });
    } catch {
      throw new Error('Could not turn on alerts on this device.');
    }
  }

  const saved = await saveSubscription(subscription, extra);
  return { subscription, saved };
}

export async function disablePush() {
  const subscription = await currentSubscription();
  if (!subscription) return;

  await fetch(`${API_BASE}/notifications/unsubscribe`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => null);

  await subscription.unsubscribe();
}

export async function detachDevice() {
  try {
    const subscription = await currentSubscription();
    if (!subscription) return;
    await apiFetch(`${API_BASE}/notifications/detach`, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  } catch {
    return;
  }
}