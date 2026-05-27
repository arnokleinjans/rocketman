const CACHE = 'rocketman-v1';

const ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/resources/Rocketman_higscore.png',
  '/resources/Rocketman_higscore_.png',
  '/resources/Rocketman_higscore_bigsize.png',
  '/resources/coin1.png',
  '/resources/coin2.png',
  '/resources/coin3.png',
  '/resources/coin4.png',
  '/resources/coin5.png',
  '/resources/coin6.png',
  '/resources/coin7.png',
  '/resources/coin8.png',
  '/resources/coin9.png',
  '/resources/cup_bronze_animated.json',
  '/resources/cup_bronze_animated.png',
  '/resources/cup_gold_animated.png',
  '/resources/cup_gold_animated__.png',
  '/resources/cup_silver_animated.png',
  '/resources/mama_bevrijd_spritesheet.json',
  '/resources/mama_bevrijd_spritesheet.png',
  '/resources/mama_komeet_spritesheet.json',
  '/resources/mama_komeet_spritesheet.png',
  '/resources/mars.png',
  '/resources/mars_spritesheet.json',
  '/resources/mars_spritesheet.png',
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
  '/resources/rocket.png',
  '/resources/rocket_vertical_spritesheet.json',
  '/resources/rocket_vertical_spritesheet.png',
  '/resources/rocketman.png',
  '/resources/rocketman_bevrijd_spritesheet.json',
  '/resources/rocketman_bevrijd_spritesheet.png',
  '/resources/rocketman_bigsize.png',
  '/resources/rocketman_gameover.png',
  '/resources/rocketman_gameover_.png',
  '/resources/rocketman_gameover_bigsize.png',
  '/resources/rocketvertical.png',
  '/resources/saturnus.png',
  '/resources/saturnusring.png',
  '/resources/sfx.png',
  '/resources/space.png',
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
