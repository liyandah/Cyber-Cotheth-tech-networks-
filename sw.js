/* CCTN static cache — bump CACHE_NAME after you change CSS/JS/HTML. */
const CACHE_NAME = 'cctn-v1-20260413';
const PRECACHE_URLS = ['./', './index.html', './style.min.css', './script.min.js'];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.map((key) => {
                        if (key !== CACHE_NAME) return caches.delete(key);
                        return undefined;
                    })
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(req, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;
            return fetch(req).then((res) => {
                if (!res || res.status !== 200 || res.type !== 'basic') return res;
                const copy = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                return res;
            });
        })
    );
});
