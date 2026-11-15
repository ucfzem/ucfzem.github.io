const CACHE_NAME = 'a3lam-al-dawa-v19';
const IMAGE_EXT = 'jpg';
const TOTAL_IMAGES = 38;


// ================== INSTALL ==================
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(['./', './index.html', './manifest.json']);
        const imgs = Array.from({ length: TOTAL_IMAGES }, (_, i) => `./images/${i + 1}.${IMAGE_EXT}`);
        await Promise.allSettled(imgs.map(url => cache.add(url)));
        console.log('[SW] Installation completed.');
    })());
    self.skipWaiting();
});


// ================== ACTIVATE ==================
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
        await self.clients.claim();
        console.log('[SW] Activation completed. Old caches cleared.');
    })());
});


// ================== FETCH ==================
self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.method !== 'GET') return;


    const url = new URL(req.url);
    if (url.origin !== location.origin) return;


    // التنقل (HTML): Network-First
    if (req.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const fresh = await fetch(req);
                if (fresh.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    event.waitUntil(cache.put(req, fresh.clone())); // ✅ انتظار مضمون
                }
                return fresh;
            } catch (err) {
                const cached = await caches.match(req);
                return cached || caches.match('./index.html');
            }
        })();
    );
        return;
    }


    // باقي الملفات (صور): Cache-First
    event.respondWith((async () => {
        const cached = await caches.match(req);
        if (cached) return cached;


        try {
            const fresh = await fetch(req);
            if (fresh.ok) {
                const cache = await caches.open(CACHE_NAME);
                event.waitUntil(cache.put(req, fresh.clone())); // ✅ انتظار مضمون
            }
            return fresh;
        } catch (err) {
            return new Response('', { status: 503, statusText: 'Offline' });
        }
    })();
});