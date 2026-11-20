/* Service Worker لـ shubuhat-wa-rudud */
var CACHE_VERSION = 'shubuhat-wa-rudud-v2026-11-20g';
var STATIC_CACHE = CACHE_VERSION + '-static';
var RUNTIME_CACHE = CACHE_VERSION + '-runtime';


/* ملفات أساسية للتصفح دون اتصال */
var PRECACHE_URLS = [
  './',
  './index.html',
  './icon.svg',
  './icon.png'
];


self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function (cache) {
        return cache.addAll(PRECACHE_URLS);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});


self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (name) {
            var isCurrentStatic = (name === STATIC_CACHE);
            var isCurrentRuntime = (name === RUNTIME_CACHE);
            if (!isCurrentStatic && !isCurrentRuntime) {
              return caches.delete(name);
            }
            return Promise.resolve();
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});


self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (!request || request.method !== 'GET') return;


  var url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }


  /* 1. طلبات التنقل للصفحات: شبكة أولاً ثم كاش */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.ok) {
            var copy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return networkResponse;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match('./index.html') || caches.match('./');
          });
        })
    );
    return;
  }


  /* 2. ملفات نفس الأصل: كاش أولاً ثم شبكة مع تخزين آمن */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(function (cachedResponse) {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then(function (networkResponse) {
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            var copy = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }


  /* 3. موارد خارجية (إن وُجدت): شبكة أولاً ثم كاش دون تعطيل التصفح */
  event.respondWith(
    fetch(request)
      .then(function (networkResponse) {
        if (networkResponse && networkResponse.ok) {
          var copy = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return networkResponse;
      })
      .catch(function () {
        return caches.match(request);
      })
  );
});
