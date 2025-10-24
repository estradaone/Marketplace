self.addEventListener('install', event => {
    console.log('📦 Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activado');
});

self.addEventListener('fetch', event => {
    // Puedes interceptar peticiones si lo deseas
    // console.log('🔎 Interceptando:', event.request.url);
});
