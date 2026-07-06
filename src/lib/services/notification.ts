import { and, eq, desc, sql } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { notifications, type Notification } from '$lib/server/db/schema';

export async function createNotification(
	db: Db,
	input: { title: string; body: string; userId: string }
): Promise<Notification> {
	const id = crypto.randomUUID();
	await db.insert(notifications).values({
		id,
		userId: input.userId,
		title: input.title,
		body: input.body,
		isRead: false,
		createdAt: new Date()
	});
	return (await getNotification(db, id))!;
}

export async function listNotifications(
	db: Db,
	userId: string,
	limit = 50
): Promise<Notification[]> {
	return db
		.select()
		.from(notifications)
		.where(eq(notifications.userId, userId))
		.orderBy(desc(notifications.createdAt))
		.limit(limit)
		.all();
}

export async function getNotification(db: Db, id: string): Promise<Notification | null> {
	return (await db.select().from(notifications).where(eq(notifications.id, id)).get()) ?? null;
}

export async function markNotificationRead(db: Db, id: string): Promise<void> {
	await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function countUnreadNotifications(db: Db, userId: string): Promise<number> {
	const row = await db
		.select({ count: sql<number>`count(*)` })
		.from(notifications)
		.where(and(eq(notifications.isRead, false), eq(notifications.userId, userId)))
		.get();
	return row?.count ?? 0;
}
