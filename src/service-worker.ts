/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// SvelteKit auto-detects and builds/registers src/service-worker.ts (vite-plugin-pwa is not used;
// @vite-pwa/sveltekit's injectManifest conflicts with Vite 8's separate client/ssr environment
// builds and breaks production builds: https://github.com/vite-pwa/sveltekit/issues/101)
declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

// Offline cache support is a later-phase feature. The fetch handler is just a
// pass-through to satisfy the PWA install criteria (it never calls respondWith, so requests flow to the network as usual)
self.addEventListener('fetch', () => {});

type PushPayload = { title: string; body: string; url?: string };

self.addEventListener('push', (event) => {
	if (!event.data) return;
	const payload = event.data.json() as PushPayload;
	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.body,
			icon: '/icon-192.png',
			badge: '/icon-192.png',
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
