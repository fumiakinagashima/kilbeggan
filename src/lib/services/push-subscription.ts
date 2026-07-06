import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { pushSubscriptions } from '$lib/server/db/schema';

export async function upsertPushSubscription(
	db: Db,
	input: { userId: string; endpoint: string; p256dh: string; auth: string }
): Promise<void> {
	await db
		.insert(pushSubscriptions)
		.values({
			id: crypto.randomUUID(),
			userId: input.userId,
			endpoint: input.endpoint,
			p256dh: input.p256dh,
			auth: input.auth,
			createdAt: new Date()
		})
		.onConflictDoUpdate({
			target: pushSubscriptions.endpoint,
			set: { p256dh: input.p256dh, auth: input.auth }
		});
}

export async function deletePushSubscription(db: Db, endpoint: string): Promise<void> {
	await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function listPushSubscriptions(db: Db, userId: string) {
	return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId)).all();
}
