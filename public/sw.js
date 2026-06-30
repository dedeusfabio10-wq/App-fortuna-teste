/**
 * Fortuna - Service Worker
 * Proporciona carregamento instantâneo e suporte offline nativo.
 */

const CACHE_NAME = 'fortuna-cache-v1';

// Recursos estáticos básicos para carregar offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.jpg'
];

// Instalar o Service Worker e cachear os recursos básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pré-cacheando recursos do Fortuna...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Ativar e limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições (estratégia: Network-First caindo para Cache)
// Para que dados atualizados sempre carreguem primeiro se online, mas abra offline de forma imediata
self.addEventListener('fetch', (event) => {
  // Ignorar requisições de API para não cachear dados dinâmicos do assistente de IA de forma indevida
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Apenas interceptar requisições GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição for bem sucedida, clonar e salvar no cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar (offline), buscar no cache do Service Worker
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Se for uma navegação de página, retornar a raiz (index.html)
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
