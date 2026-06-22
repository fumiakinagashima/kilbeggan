import { eq, desc, inArray, or, and } from 'drizzle-orm';
import type { Db } from './index';
import { activities, activityMentions, customers, users } from './schema';

export async function listActivities(db: Db, limit = 50, viewingUserId?: string) {
	const acts = await db
		.select({
			id: activities.id,
			body: activities.body,
			isPrivate: activities.isPrivate,
			createdAt: activities.createdAt,
			userId: activities.userId,
			userName: users.name
		})
		.from(activities)
		.leftJoin(users, eq(activities.userId, users.id))
		.where(
			viewingUserId
				? or(eq(activities.isPrivate, false), eq(activities.userId, viewingUserId))
				: eq(activities.isPrivate, false)
		)
		.orderBy(desc(activities.createdAt))
		.limit(limit)
		.all();

	if (acts.length === 0) return [];

	const actIds = acts.map((a) => a.id);
	const mentions = await db
		.select({
			activityId: activityMentions.activityId,
			customerId: activityMentions.customerId,
			company: customers.company
		})
		.from(activityMentions)
		.leftJoin(customers, eq(activityMentions.customerId, customers.id))
		.where(inArray(activityMentions.activityId, actIds))
		.all();

	const byActivity = new Map<string, { customerId: string; company: string }[]>();
	for (const m of mentions) {
		if (!byActivity.has(m.activityId)) byActivity.set(m.activityId, []);
		byActivity.get(m.activityId)!.push({ customerId: m.customerId, company: m.company ?? '' });
	}

	return acts.map((a) => ({ ...a, mentions: byActivity.get(a.id) ?? [] }));
}

export async function listActivitiesByCustomer(db: Db, customerId: string, viewingUserId?: string) {
	const mentionRows = await db
		.select({ activityId: activityMentions.activityId })
		.from(activityMentions)
		.where(eq(activityMentions.customerId, customerId))
		.all();

	if (mentionRows.length === 0) return [];

	const actIds = mentionRows.map((m) => m.activityId);
	return db
		.select({
			id: activities.id,
			body: activities.body,
			isPrivate: activities.isPrivate,
			createdAt: activities.createdAt,
			userId: activities.userId,
			userName: users.name
		})
		.from(activities)
		.leftJoin(users, eq(activities.userId, users.id))
		.where(
			and(
				inArray(activities.id, actIds),
				viewingUserId
					? or(eq(activities.isPrivate, false), eq(activities.userId, viewingUserId))
					: eq(activities.isPrivate, false)
			)
		)
		.orderBy(desc(activities.createdAt))
		.all();
}

export async function createActivity(
	db: Db,
	data: { userId: string; body: string; isPrivate: boolean; mentionedCustomerIds: string[] }
) {
	const id = crypto.randomUUID();
	const createdAt = new Date();
	await db
		.insert(activities)
		.values({ id, userId: data.userId, body: data.body, isPrivate: data.isPrivate, createdAt });

	if (data.mentionedCustomerIds.length > 0) {
		await db.insert(activityMentions).values(
			data.mentionedCustomerIds.map((customerId) => ({
				id: crypto.randomUUID(),
				activityId: id,
				customerId,
				createdAt
			}))
		);
	}

	return {
		id,
		userId: data.userId,
		body: data.body,
		isPrivate: data.isPrivate,
		createdAt,
		mentions: [] as { customerId: string; company: string }[]
	};
}

export async function updateActivityPrivacy(
	db: Db,
	id: string,
	isPrivate: boolean
): Promise<boolean> {
	const result = await db
		.update(activities)
		.set({ isPrivate })
		.where(eq(activities.id, id))
		.returning({ id: activities.id });
	return result.length > 0;
}
