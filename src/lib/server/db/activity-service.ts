import { eq, desc, inArray, or, and } from 'drizzle-orm';
import type { Db } from './index';
import { activities, activityMentions, customers, users } from './schema';

export type Attachment = { key: string; name: string };

function parseAttachments(json: string | null): Attachment[] {
	if (!json) return [];
	const parsed = JSON.parse(json) as Array<string | Attachment>;
	return parsed.map((a) =>
		typeof a === 'string' ? { key: a, name: a.split('/').pop() ?? a } : a
	);
}

function parseTags(json: string | null): string[] {
	if (!json) return [];
	try {
		return JSON.parse(json) as string[];
	} catch {
		return [];
	}
}

export async function listActivities(db: Db, limit = 50, viewingUserId?: string) {
	const acts = await db
		.select({
			id: activities.id,
			body: activities.body,
			isPrivate: activities.isPrivate,
			attachments: activities.attachments,
			tags: activities.tags,
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

	return acts.map((a) => ({
		...a,
		attachments: parseAttachments(a.attachments),
		tags: parseTags(a.tags),
		mentions: byActivity.get(a.id) ?? []
	}));
}

export async function listActivitiesByCustomer(db: Db, customerId: string, viewingUserId?: string) {
	const activityIdRows = await db
		.select({ activityId: activityMentions.activityId })
		.from(activityMentions)
		.where(eq(activityMentions.customerId, customerId))
		.all();

	if (activityIdRows.length === 0) return [];

	const actIds = activityIdRows.map((m) => m.activityId);
	const rows = await db
		.select({
			id: activities.id,
			body: activities.body,
			isPrivate: activities.isPrivate,
			attachments: activities.attachments,
			tags: activities.tags,
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
	if (rows.length === 0) return [];

	const rowIds = rows.map((a) => a.id);
	const mentionRows = await db
		.select({
			activityId: activityMentions.activityId,
			customerId: activityMentions.customerId,
			company: customers.company
		})
		.from(activityMentions)
		.leftJoin(customers, eq(activityMentions.customerId, customers.id))
		.where(inArray(activityMentions.activityId, rowIds))
		.all();

	const byActivity = new Map<string, { customerId: string; company: string }[]>();
	for (const m of mentionRows) {
		if (!byActivity.has(m.activityId)) byActivity.set(m.activityId, []);
		byActivity.get(m.activityId)!.push({ customerId: m.customerId, company: m.company ?? '' });
	}

	return rows.map((a) => ({
		...a,
		attachments: parseAttachments(a.attachments),
		tags: parseTags(a.tags),
		mentions: byActivity.get(a.id) ?? []
	}));
}

export async function createActivity(
	db: Db,
	data: {
		userId: string;
		body: string;
		isPrivate: boolean;
		mentionedCustomerIds: string[];
		attachments?: Attachment[];
	}
) {
	const id = crypto.randomUUID();
	const createdAt = new Date();
	const attachmentsJson =
		data.attachments && data.attachments.length > 0 ? JSON.stringify(data.attachments) : null;
	await db.insert(activities).values({
		id,
		userId: data.userId,
		body: data.body,
		isPrivate: data.isPrivate,
		attachments: attachmentsJson,
		createdAt
	});

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
		attachments: data.attachments ?? ([] as Attachment[]),
		createdAt,
		mentions: [] as { customerId: string; company: string }[]
	};
}

export async function getActivity(db: Db, id: string) {
	const act = await db
		.select({
			id: activities.id,
			body: activities.body,
			isPrivate: activities.isPrivate,
			attachments: activities.attachments,
			tags: activities.tags,
			createdAt: activities.createdAt,
			userId: activities.userId,
			userName: users.name
		})
		.from(activities)
		.leftJoin(users, eq(activities.userId, users.id))
		.where(eq(activities.id, id))
		.get();

	if (!act) return null;

	const mentions = await db
		.select({
			customerId: activityMentions.customerId,
			company: customers.company
		})
		.from(activityMentions)
		.leftJoin(customers, eq(activityMentions.customerId, customers.id))
		.where(eq(activityMentions.activityId, id))
		.all();

	return {
		...act,
		attachments: parseAttachments(act.attachments),
		tags: parseTags(act.tags),
		mentions: mentions.map((m) => ({ customerId: m.customerId, company: m.company ?? '' }))
	};
}

export async function updateActivityTags(db: Db, id: string, tags: string[]): Promise<void> {
	await db
		.update(activities)
		.set({ tags: JSON.stringify(tags) })
		.where(eq(activities.id, id));
}

export async function updateActivity(
	db: Db,
	id: string,
	data: { body: string; isPrivate: boolean; mentionedCustomerIds: string[]; attachments?: Attachment[] }
): Promise<void> {
	const attachmentsJson =
		data.attachments && data.attachments.length > 0 ? JSON.stringify(data.attachments) : null;
	await db
		.update(activities)
		.set({ body: data.body, isPrivate: data.isPrivate, attachments: attachmentsJson })
		.where(eq(activities.id, id));
	await db.delete(activityMentions).where(eq(activityMentions.activityId, id));
	if (data.mentionedCustomerIds.length > 0) {
		await db.insert(activityMentions).values(
			data.mentionedCustomerIds.map((customerId) => ({
				id: crypto.randomUUID(),
				activityId: id,
				customerId,
				createdAt: new Date()
			}))
		);
	}
}

export async function deleteActivity(db: Db, id: string): Promise<void> {
	await db.delete(activityMentions).where(eq(activityMentions.activityId, id));
	await db.delete(activities).where(eq(activities.id, id));
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
