// Offline cache for the Trip Splitter app. Bump VERSION when files change.
const VERSION = 'splitter-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
  './fonts/inter-latin-400-normal.woff2', './fonts/inter-latin-500-normal.woff2',
  './fonts/inter-latin-600-normal.woff2', './fonts/inter-latin-700-normal.woff2',
  './fonts/inter-latin-800-normal.woff2',
  './fonts/inter-latin-ext-400-normal.woff2', './fonts/inter-latin-ext-600-normal.woff2',
  './fonts/inter-latin-ext-700-normal.woff2', './fonts/inter-latin-ext-800-normal.woff2'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});
