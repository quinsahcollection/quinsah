const CACHE_NAME = 'kasir-offline-v1';

// Daftar file yang mau disimpan di memori HP/PC
// Gunakan './' agar aman saat di-hosting di GitHub Pages
const urlsToCache = [
    './',
    './index.html' // Sesuaikan jika nama file HTML Anda bukan index.html
];

// 1. Proses Install: Menyimpan file ke memori lokal
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache berhasil dibuka');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Proses Fetch: Mengambil data dari internet ATAU dari memori lokal jika offline
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Jika internet nyala, simpan versi terbarunya ke cache diam-diam
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                let responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            })
            .catch(() => {
                // JIKA INTERNET MATI, AMBIL DARI CACHE (MEMORI LOKAL)
                return caches.match(event.request);
            })
    );
});

// 3. Proses Activate: Membersihkan cache lama jika ada versi aplikasi baru
self.addEventListener('activate', event => {
    const cacheAllowlist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
