self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Nueva notificación';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: {
      url: data.url || '/',
      conversationId: data.conversationId || null,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  const conversationId = event.notification.data?.conversationId;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === self.location.origin + url && conversationId) {
          client.postMessage({ type: 'OPEN_CONVERSATION', conversationId });
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
