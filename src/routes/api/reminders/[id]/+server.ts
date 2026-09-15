import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { deleteReminder, getReminder, updateReminder } from '$lib/services/reminder';
import { parseJstDatetime } from '$lib/datetime';

const updateSchema = z.object({
	remind_at: z.string().min(1),
	content: z.string().min(1),
	channels: z.string().min(1)
});

export async function PATCH({ params, request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(platform!.env.DB);
	const reminder = await getReminder(db, params.id);
	if (!reminder) return json({ error: 'Not found' }, { status: 404 });
	if (reminder.userId !== locals.user.userId) return json({ error: 'Forbidden' }, { status: 403 });
	if (reminder.status !== 'pending') {
		return json(
			{ error: 'Reminders that have already been sent cannot be edited' },
			{ status: 400 }
		);
	}

	const body = await request.json();
	const parsed = updateSchema.safeParse(body);
	if (!parsed.success) return json({ error: 'Invalid input' }, { status: 400 });

	const channels = parsed.data.channels
		.split(',')
		.map((c) => c.trim())
		.filter(Boolean);
	if (channels.length === 0) return json({ error: 'Invalid input' }, { status: 400 });

	const row = await updateReminder(db, params.id, {
		remindAt: parseJstDatetime(parsed.data.remind_at),
		content: parsed.data.content.trim(),
		channels
	});
	return json(row);
}

export async function DELETE({ params, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(platform!.env.DB);
	const reminder = await getReminder(db, params.id);
	if (!reminder) return json({ error: 'Not found' }, { status: 404 });
	if (reminder.userId !== locals.user.userId) return json({ error: 'Forbidden' }, { status: 403 });

	await deleteReminder(db, params.id);
	return new Response(null, { status: 204 });
}
