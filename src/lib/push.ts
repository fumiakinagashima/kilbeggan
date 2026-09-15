// Converts a base64url string into the Uint8Array required by PushManager.subscribe's applicationServerKey
function urlBase64ToUint8Array(base64Url: string): Uint8Array {
	const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
	const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function isPushSupported(): boolean {
	return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
	if (!isPushSupported()) return null;
	const registration = await navigator.serviceWorker.ready;
	return registration.pushManager.getSubscription();
}

export async function subscribeToPush(vapidPublicKey: string): Promise<void> {
	const registration = await navigator.serviceWorker.ready;
	const subscription = await registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource
	});
	const json = subscription.toJSON();
	await fetch('/api/push/subscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys })
	});
}

export async function unsubscribeFromPush(): Promise<void> {
	const subscription = await getPushSubscription();
	if (!subscription) return;
	const endpoint = subscription.endpoint;
	await subscription.unsubscribe();
	await fetch('/api/push/unsubscribe', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ endpoint })
	});
}
