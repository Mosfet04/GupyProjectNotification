'use strict';

self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'Notificação';
    const options = {
        body: `Nova notificacao da empresa ${event.data.text()} na gupy`,
        icon: 'images/icon.png',
        badge: 'images/badge.png',
        action: event.data.text(),
        data: `https://${event.data.text()}.gupy.io/candidates/applications`
    };
    

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});