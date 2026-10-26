const VERSION = 'v1';
const CACHE = `sahayota-${VERSION}`;
const CACHING = new URL(self.location.href).searchParams.get('cache') === '1';
const OFFLINE_PAGES = ['/', '/first-aid', '/hospitals', '/sos'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  if (CACHING) event.waitUntil(caches.open(CACHE).then(warm).catch(() => null));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      if (!CACHING) return;

      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith('sahayota-') && n !== CACHE).map((n) => caches.delete(n)));
      await trim(220);
    })()
  );
});

async function warm(cache) {
  for (const path of OFFLINE_PAGES) {
    try {
      const res = await fetch(path, { credentials: 'same-origin' });
      if (!res.ok) continue;

      await cache.put(path, res.clone());
      const html = await res.text();
      const assets = new Set(html.match(/\/_next\/static\/[^"'\\\s)<>]+/g) || []);

      await Promise.all(
        [...assets].map(async (asset) => {
          try {
            if (await cache.match(asset)) return;
            const r = await fetch(asset);
            if (r.ok) await cache.put(asset, r);
          } catch (e) {
            return;
          }
        })
      );
    } catch (e) {
      continue;
    }
  }
}

async function trim(max) {
  const cache = await caches.open(CACHE);
  const keys = await cache.keys();
  const removable = keys.filter((k) => !OFFLINE_PAGES.includes(new URL(k.url).pathname));
  const extra = removable.length - max;
  for (let i = 0; i < extra; i += 1) await cache.delete(removable[i]);
}

function offlineResponse() {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Offline | Sahayota</title>
<style>
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#F4F6FB;color:#0F172A;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{width:100%;max-width:26rem;text-align:center}
.icon{width:72px;height:72px;margin:0 auto 20px;border-radius:24px;background:#E0E7FF;display:flex;align-items:center;justify-content:center;font-size:34px}
h1{margin:0 0 8px;font-size:26px}
p{margin:0 0 20px;color:#475569;line-height:1.6;font-size:15px}
a,button{display:block;width:100%;margin-top:10px;padding:15px 18px;border-radius:999px;border:1px solid #CBD5E1;background:#fff;color:#0F172A;font-size:15px;font-weight:600;text-decoration:none;cursor:pointer;font-family:inherit}
a.red{background:#E11D48;border-color:#E11D48;color:#fff;font-size:18px}
small{display:block;margin-top:18px;color:#64748B;font-size:12px;line-height:1.5}
</style>
</head>
<body>
<main>
<div class="icon">📡</div>
<h1>You are offline</h1>
<p>There is no internet right now. In an emergency, call 999.</p>
<a class="red" href="tel:999">Call 999</a>
<a href="/first-aid">First aid guide</a>
<a href="/hospitals">Hospitals and numbers</a>
<a href="/sos">SOS: share my location</a>
<button onclick="location.reload()">Try again</button>
<small>Saved pages open only if you opened them once while you had internet.</small>
</main>
<script>addEventListener('online',function(){location.reload()})</script>
</body>
</html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

async function handleNavigate(event, url) {
  const cache = await caches.open(CACHE);
  const cacheable = OFFLINE_PAGES.includes(url.pathname) && !url.search;
  const key = url.origin + url.pathname;
  const network = fetch(event.request);
  network.catch(() => null);

  if (!cacheable) {
    try {
      return await network;
    } catch (e) {
      return offlineResponse();
    }
  }

  try {
    const res = await Promise.race([
      network,
      new Promise((_, reject) => setTimeout(() => reject(new Error('slow')), 3500)),
    ]);
    if (res.ok && !res.redirected) event.waitUntil(cache.put(key, res.clone()));
    return res;
  } catch (e) {
    const hit = await cache.match(key);
    if (hit) return hit;
    try {
      return await network;
    } catch (err) {
      return offlineResponse();
    }
  }
}

async function cacheFirst(event, request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;

  const res = await fetch(request);
  if (res.ok) event.waitUntil(cache.put(request, res.clone()));
  return res;
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);

  const refresh = fetch(request)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);

  if (hit) {
    event.waitUntil(refresh);
    return hit;
  }

  const res = await refresh;
  return res || Response.error();
}

self.addEventListener('fetch', (event) => {
  if (!CACHING) return;

  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, request));
    return;
  }

  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js' || url.searchParams.has('_rsc') || request.headers.get('RSC')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(event, url));
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(event, request));
    return;
  }

  if (/^\/(logo\.svg|icon\.svg|manifest\.webmanifest|pwa-icon\/)/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event, request));
  }
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }

  const options = {
    body: data.body || '',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: data.tag || 'sahayota',
    renotify: Boolean(data.tag),
    requireInteraction: Boolean(data.urgent),
    vibrate: data.urgent ? [250, 120, 250, 120, 250] : [120],
    data: { url: data.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Sahayota', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) {
        const client = list[0];
        return client.focus().then(() => ('navigate' in client ? client.navigate(target) : undefined));
      }
      return self.clients.openWindow(target);
    })
  );
});