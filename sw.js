/**
 * ABC Global Church - Service Worker
 * Enables offline caching, faster repeat visits, and resource pre-caching
 * Version: 1.0.0
 */

const CACHE_NAME = 'abc-global-v2';

// Core assets to pre-cache on install (critical for offline experience)
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/giving.html',
    '/testimonies.html',
    '/prayer.html',
    '/connect.html',
    '/branches.html',
    '/history.html',
    '/spa-router.js',
    '/images/logo.png'
];

// Install event: pre-cache critical assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting();
        }).catch(function() {
            // Silently fail - don't block installation
        })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch event: Network-first strategy for HTML, Cache-first for static assets
self.addEventListener('fetch', function(event) {
    var request = event.request;
    var url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests except for allowed CDNs
    var allowedOrigins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://unpkg.com',
        'https://stream.zeno.fm',
        'https://api.zeno.fm',
        'https://z-cdn-media.chatglm.cn'
    ];
    var isSameOrigin = url.origin === self.location.origin;
    var isAllowedCDN = allowedOrigins.some(function(origin) {
        return url.href.startsWith(origin);
    });

    if (!isSameOrigin && !isAllowedCDN) return;

    // For audio/streaming requests: network only (don't cache media streams)
    if (url.href.includes('stream.zeno.fm') || url.href.includes('.mp3') || url.href.includes('.aac')) {
        return;
    }

    // For PHP form handlers: network only
    if (url.pathname.endsWith('.php')) {
        return;
    }

    // Strategy: Cache-first for static assets (images, fonts, CSS, JS)
    if (isStaticAsset(url)) {
        event.respondWith(
            caches.match(request).then(function(cached) {
                if (cached) {
                    // Return cached, but also update cache in background
                    fetchAndCache(request);
                    return cached;
                }
                return fetchAndCache(request);
            }).catch(function() {
                return new Response('', { status: 408 });
            })
        );
        return;
    }

    // Strategy: Network-first for HTML pages (fresh content preferred)
    if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request).then(function(response) {
                if (response && response.status === 200) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            }).catch(function() {
                return caches.match(request).then(function(cached) {
                    return cached || caches.match('/index.html');
                });
            })
        );
        return;
    }

    // Default: try network, fall back to cache
    event.respondWith(
        fetch(request).then(function(response) {
            if (response && response.status === 200) {
                var responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(request, responseClone);
                });
            }
            return response;
        }).catch(function() {
            return caches.match(request);
        })
    );
});

/**
 * Check if a URL points to a static asset
 */
function isStaticAsset(url) {
    var staticExtensions = [
        '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg',
        '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.otf'
    ];
    return staticExtensions.some(function(ext) {
        return url.pathname.endsWith(ext);
    });
}

/**
 * Fetch a resource and cache it
 */
function fetchAndCache(request) {
    return fetch(request).then(function(response) {
        if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function(cache) {
                cache.put(request, responseClone);
            });
        }
        return response;
    });
}
