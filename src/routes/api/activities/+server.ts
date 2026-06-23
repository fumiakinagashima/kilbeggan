import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { createActivity } from '$lib/server/db/activity-service';
import { parseMentionIds } from '$lib/body';

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

	return json({ ...activity, userName: locals.user.name }, { status: 201 });
}
