self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        data = {};
    }

    event.waitUntil(
        Promise.all([
            self.registration.showNotification(data.title || 'رسالة جديدة', {
                body: data.body || '',
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: data.tag || 'message',
                dir: 'rtl',
                lang: 'ar',
                data: { url: data.url || '/messages' }
            }),
            self.clients
                .matchAll({ type: 'window', includeUncontrolled: true })
                .then((list) => list.forEach((client) => client.postMessage({ type: 'push' })))
        ])
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const target = new URL(
        (event.notification.data && event.notification.data.url) || '/messages',
        self.location.origin
    ).href;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (list) => {
            for (const client of list) {
                if ('focus' in client) {
                    await client.focus();
                    if ('navigate' in client) await client.navigate(target).catch(() => { });
                    return undefined;
                }
            }
            return self.clients.openWindow(target);
        })
    );
});