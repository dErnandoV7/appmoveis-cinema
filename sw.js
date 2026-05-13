/**
 * Service Worker - Cache API
 */
const CACHE_NAME = 'flashstudy-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/db.js',
    '/js/canvas.js',
    '/js/app.js',
    '/manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .catch(err => console.error('Erro cache:', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(names =>
            Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => {
            if (response) return response;
            return fetch(e.request).catch(() => {
                if (e.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});