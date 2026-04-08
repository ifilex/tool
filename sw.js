// sw.js - Service Worker simplificado para WineBox Tool
const CACHE_NAME = 'winebox-v1';

// Instalación: solo cachear lo esencial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Solo cachear la página principal, el resto se cargará de la red
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]).catch(err => {
        console.log('Error al cachear archivos esenciales:', err);
      });
    })
  );
  self.skipWaiting();
});

// Fetch: intentar caché primero, después red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
        // No cachear si no es exitoso
        if (!response || response.status !== 200) {
          return response;
        }
        // Cachear solo recursos estáticos (js, css, png, json)
        const url = new URL(event.request.url);
        if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|json)$/)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});