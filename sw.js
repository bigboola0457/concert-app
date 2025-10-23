// Название кэша и файлы, которые нужно сохранить
const CACHE_NAME = 'guest-checker-v1';
const FILES_TO_CACHE = [
    'index.html',
    'manifest.json',
    'icon.png' // Убедитесь, что иконка здесь указана
];

// 1. Установка (Кэширование файлов)
self.addEventListener('install', (event) => {
    console.log('[SW] Установка Service Worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Кэширование основных файлов');
                return cache.addAll(FILES_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// 2. Активация (Очистка старого кэша)
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация Service Worker');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// 3. Перехват запросов (Отдача из кэша)
self.addEventListener('fetch', (event) => {
    console.log('[SW] Перехват запроса:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Если файл есть в кэше, отдаем его
                if (response) {
                    console.log('[SW] Отдача из кэша:', event.request.url);
                    return response;
                }
                
                // Если файла нет в кэше, пробуем загрузить из сети
                console.log('[SW] Запрос из сети:', event.request.url);
                return fetch(event.request);
            })
    );
});