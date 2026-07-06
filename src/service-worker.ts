/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

type PushPayload = { title: string; body: string; url?: string };

self.addEventListener('push', (event) => {
	if (!event.data) return;
	const payload = event.data.json() as PushPayload;
	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.body,
			icon: '/icon-192.svg',
			badge: '/icon-192.svg',
			data: { url: payload.url ?? '/' }
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = (event.notification.data as { url?: string } | undefined)?.url ?? '/';
	event.waitUntil(
		self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
			for (const client of clientList) {
				if (client.url === url && 'focus' in client) return client.focus();
			}
			return self.clients.openWindow(url);
		})
	);
});
