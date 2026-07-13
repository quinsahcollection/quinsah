// PERBAIKAN: Ganti versi ini (misal: v2, v3, v4) setiap kali Anda edit index.html
const CACHE_NAME = 'kasir-offline-v2';

const urlsToCache = [
    './',
    './index.html',
    './manifest.json' // Bagus jika manifest dimasukkan juga agar PWA stabil
];

// 1. Proses Install
self.addEventListener('install', event => {
    // PERBAIKAN UTAMA: Paksa Service Worker baru langsung aktif tanpa menunggu tab ditutup
    self.skipWaiting(); 
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache berhasil dibuka: ' + CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Proses Fetch (Mengambil data)
self.addEventListener('fetch', event => {
    // PENGAMAN: Hanya proses request dengan method GET (ambil data/file). 
    // Jangan cache request POST/PUT/DELETE (simpan/edit data ke database).
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
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
                return caches.match(event.request);
            })
    );
});

// 3. Proses Activate (Membersihkan sampah cache lama)
self.addEventListener('activate', event => {
    const cacheAllowlist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        console.log('Menghapus cache usang:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // PERBAIKAN UTAMA: Langsung ambil alih kontrol halaman kasir saat ini juga
            return self.clients.claim(); 
        })
    );
});
