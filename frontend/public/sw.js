// ─── Kairos Service Worker ────────────────────────────────────────────────────

const CACHE_NAME = 'kairos-sw-v1';

// Instalar: pular espera para ativar imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Ativar: assumir o controle de todos os clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title   = data.title   ?? 'Kairos';
  const body    = data.body    ?? 'Seu dia ainda não foi registrado. 2 minutos para capturar o que foi mais significativo.';
  const url     = data.url     ?? '/ferramentas/diario-bordo';
  const icon    = data.icon    ?? '/icon-192.png';
  const badge   = data.badge   ?? '/icon-192.png';

  const options = {
    body,
    icon,
    badge,
    tag:              'kairos-diario',   // substitui notificação anterior da mesma tag
    renotify:         false,
    requireInteraction: false,
    data:             { url },
    actions: [
      { action: 'registrar', title: 'Registrar agora' },
      { action: 'depois',    title: 'Mais tarde'       },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ─── Clique na Notificação ────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Ignorar ação "mais tarde"
  if (event.action === 'depois') return;

  const targetUrl = event.notification.data?.url ?? '/ferramentas/diario-bordo';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focar janela já aberta se possível
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Abrir nova janela
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
