const CACHE = 'rocketman-v4';

const ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/resources/Rocketman_higscore.png',
  '/resources/mama_bevrijd_spritesheet.json',
  '/resources/mama_bevrijd_spritesheet.png',
  '/resources/mama_komeet_spritesheet.json',
  '/resources/mama_komeet_spritesheet.png',
  '/resources/meisje_bevrijd_spritesheet.json',
  '/resources/meisje_bevrijd_spritesheet.png',
  '/resources/meisje_komeet_spritesheet.json',
  '/resources/meisje_komeet_spritesheet.png',
  '/resources/neef_bevrijd_spritesheet.json',
  '/resources/neef_bevrijd_spritesheet.png',
  '/resources/neef_komeet_spritesheet.json',
  '/resources/neef_komeet_spritesheet.png',
  '/resources/papa_komeet_spritesheet.json',
  '/resources/papa_komeet_spritesheet.png',
  '/resources/rocketman.png',
  '/resources/rocketman_bevrijd_spritesheet.json',
  '/resources/rocketman_bevrijd_spritesheet.png',
  '/resources/rocketman_gameover.png',
  '/resources/zoon_bevrijd_spritesheet.json',
  '/resources/zoon_bevrijd_spritesheet.png',
  '/resources/zoon_bozekomeet_spritesheet.json',
  '/resources/zoon_bozekomeet_spritesheet.png',
  '/resources/zoon_komeet_spritesheet.json',
  '/resources/zoon_komeet_spritesheet.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
