import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { createReminderRow } from '$lib/services/reminder';
import { parseJstDatetime } from '$lib/datetime';

const createSchema = z.object({
	remind_at: z.string().min(1),
	content: z.string().min(1),
	channels: z.string().min(1)
});

export async function POST({ request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return json({ error: 'Invalid input' }, { status: 400 });

	const channels = parsed.data.channels
		.split(',')
		.map((c) => c.trim())
		.filter(Boolean);
	if (channels.length === 0) return json({ error: 'Invalid input' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	const row = await createReminderRow(db, {
		remindAt: parseJstDatetime(parsed.data.remind_at),
		content: parsed.data.content.trim(),
		channels,
		userId: locals.user.userId
	});
	return json(row, { status: 201 });
}
