const CACHING = process.env.NODE_ENV === 'production';

export async function registerSW() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

  try {
    await navigator.serviceWorker.register(CACHING ? '/sw.js?cache=1' : '/sw.js', { scope: '/' });
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}