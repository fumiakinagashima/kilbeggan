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

// 410 Gone / 404 Not Found はブラウザ側で購読が失効している合図。呼び出し側で該当購読を削除する
export class PushSubscriptionExpiredError extends Error {}

export async function sendPushNotification(
	subscription: PushSubscription,
	payload: PushPayload,
	env: PushEnv
): Promise<void> {
	if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || !env.VAPID_SUBJECT) {
		throw new Error('プッシュ通知が設定されていません（VAPID_*環境変数を確認してください）');
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

	// @cloudflare/workers-typesのRequestInit型定義がUint8ArrayをBodyInitとして
	// 認識しないため、ランタイムには問題ない値をアサーションで通す
	const res = await fetch(subscription.endpoint, init as RequestInit);
	if (res.status === 404 || res.status === 410) {
		throw new PushSubscriptionExpiredError(`購読が失効しています (${res.status})`);
	}
	if (!res.ok) {
		throw new Error(`Push送信エラー ${res.status}: ${await res.text()}`);
	}
}
