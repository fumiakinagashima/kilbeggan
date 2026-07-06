/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// SvelteKitがsrc/service-worker.tsを自動検出しビルド・登録する（vite-plugin-pwaは使わない。
// @vite-pwa/sveltekitのinjectManifestはVite 8のclient/ssr環境分離ビルドと競合し
// 本番ビルドが失敗するため: https://github.com/vite-pwa/sveltekit/issues/101）
declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

// オフラインキャッシュ対応は後フェーズ。fetchハンドラはPWAインストール条件を満たすための
// pass-through（respondWithを呼ばないのでリクエストは通常通りネットワークに流れる）
self.addEventListener('fetch', () => {});

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
