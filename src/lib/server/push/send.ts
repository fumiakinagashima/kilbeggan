import {
	buildPushPayload,
	type PushSubscription as WebPushSubscription
} from '@block65/webcrypto-web-push';
import type { PushSubscription } from '$lib/server/db/schema';

export type PushEnv = {
	VAPID_PUBLIC_KEY?: string;
	VAPID_PRIVATE_KEY?: string;
	VAPID_SUBJECT?: string;
};

export type PushPayload = { title: string; body: string; url?: string };

// 410 Gone / 404 Not Found indicates the subscription has expired on the browser side. The caller should delete the corresponding subscription.
export class PushSubscriptionExpiredError extends Error {}

export async function sendPushNotification(
	subscription: PushSubscription,
	payload: PushPayload,
	env: PushEnv
): Promise<void> {
	if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
		throw new Error('Push notifications are not configured (check VAPID_* environment variables)');
	}

	const target: WebPushSubscription = {
		endpoint: subscription.endpoint,
		expirationTime: null,
		keys: { p256dh: subscription.p256dh, auth: subscription.auth }
	};

	const init = await buildPushPayload({ data: payload }, target, {
		subject: env.VAPID_SUBJECT,
		publicKey: env.VAPID_PUBLIC_KEY,
		privateKey: env.VAPID_PRIVATE_KEY
	});

	// @cloudflare/workers-types' RequestInit type definition doesn't recognize
	// Uint8Array as a BodyInit, so we pass a value that's fine at runtime via a type assertion
	const res = await fetch(subscription.endpoint, init as RequestInit);
	if (res.status === 404 || res.status === 410) {
		throw new PushSubscriptionExpiredError(`Subscription has expired (${res.status})`);
	}
	if (!res.ok) {
		throw new Error(`Push send error ${res.status}: ${await res.text()}`);
	}
}
