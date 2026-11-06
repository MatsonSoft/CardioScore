const CACHE = 'cardioscore-v2';
const CALCS = [
  '/tools/apple/index.html','/tools/arc-hbr/index.html','/tools/cha2ds2-va/index.html',
  '/tools/charge-af/index.html','/tools/findrisk/index.html','/tools/grace/index.html',
  '/tools/has-bled/index.html','/tools/kfre/index.html','/tools/mesa/index.html',
  '/tools/orbit/index.html','/tools/prevent/index.html','/tools/qrisk3/index.html',
  '/tools/riesgo-30-anos/index.html','/tools/score2/index.html','/tools/score2-lac/index.html','/tools/score2-ckd/index.html',
  '/tools/score2-diabetes/index.html','/tools/score2-hf/index.html','/tools/score2-op/index.html',
  '/tools/smart2/index.html','/tools/spi2/index.html','/tools/who-cla/index.html'
];
const CORE = [
  '/', '/index.html', '/metodologia.html', '/terminos.html', '/tools/index.html',
  '/favicon.svg', '/og-image.png', '/manifest.json',
  '/tailwind.css', '/vendor/jspdf.umd.min.js', '/vendor/jspdf.plugin.autotable.min.js',
  '/icons/icon-192.png', '/icons/icon-512.png'
].concat(CALCS);

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  // Navegación: cache-first con revalidación (rápida)
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match(e.request).then(function (cached) {
      var red = fetch(e.request).then(function (res) {
        var clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        return res;
      }).catch(function () { return cached; });
      return cached || red;
    }));
    return;
  }

  // Assets estáticos: cache-first
  e.respondWith(caches.match(e.request).then(function (r) {
    return r || fetch(e.request).then(function (res) {
      var clone = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
      return res;
    });
  }));
});
