import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import {
	createActivity,
	updateActivityTags,
	listActivitiesByCustomer,
	listActivities,
	ACTIVITIES_PAGE_SIZE
} from '$lib/server/db/activity-service';
import { parseMentionIds } from '$lib/body';
import { classifyActivity } from '$lib/server/ai/classify';
import { scoreCustomer } from '$lib/server/ai/score';
import { updateCustomerScore } from '$lib/server/db/customer-service';

export async function GET({ url, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const cursorParam = url.searchParams.get('cursor');
	const cursor = cursorParam ? new Date(parseInt(cursorParam)) : undefined;

	const db = getDb(platform!.env.DB);
	const items = await listActivities(db, ACTIVITIES_PAGE_SIZE, locals.user.userId, cursor);

	return json({
		activities: items,
		hasMore: items.length === ACTIVITIES_PAGE_SIZE
	});
}

const attachmentSchema = z.object({ key: z.string(), name: z.string() });

const createSchema = z.object({
	body: z.string().min(1),
	isPrivate: z.boolean().optional().default(false),
	attachments: z.array(attachmentSchema).optional().default([])
});

export async function POST({ request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const raw = await request.json();
	const parsed = createSchema.safeParse(raw);
	if (!parsed.success) return json({ error: '入力値が不正です' }, { status: 400 });

	const mentionedCustomerIds = parseMentionIds(parsed.data.body);
	const db = getDb(platform!.env.DB);
	const activity = await createActivity(db, {
		userId: locals.user.userId,
		body: parsed.data.body,
		isPrivate: parsed.data.isPrivate,
		mentionedCustomerIds,
		attachments: parsed.data.attachments
	});

	// タグ付け・スコアリングを非同期で実行（レスポンスをブロックしない）
	const apiKey = platform?.env?.ANTHROPIC_API_KEY;
	if (apiKey) {
		const mockAi = platform?.env?.MOCK_AI;
		platform!.ctx.waitUntil(
			Promise.all([
				classifyActivity(apiKey, parsed.data.body, mockAi)
					.then((tags) => updateActivityTags(db, activity.id, tags))
					.catch(() => {}),
				...mentionedCustomerIds.map((customerId) =>
					listActivitiesByCustomer(db, customerId)
						.then((acts) =>
							scoreCustomer(
								apiKey,
								acts.map((a) => ({ body: a.body, createdAt: a.createdAt, tags: a.tags })),
								mockAi
							)
						)
						.then((result) => result && updateCustomerScore(db, customerId, result.score))
						.catch(() => {})
				)
			])
		);
	}

	return json({ ...activity, userName: locals.user.name }, { status: 201 });
}
