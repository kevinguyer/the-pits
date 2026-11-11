// Network first, cache as the offline fallback.
const CACHE = 'the-pits-v4';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'assets/splash.webp', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); } return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
