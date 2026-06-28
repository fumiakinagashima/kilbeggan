import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { activities } from '$lib/server/db/schema';
import { updateActivityPrivacy, deleteActivity } from '$lib/server/db/activity-service';

const patchSchema = z.object({
	isPrivate: z.boolean()
});

export async function PATCH({ params, request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json();
	const parsed = patchSchema.safeParse(body);
	if (!parsed.success) return json({ error: '入力値が不正です' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	const activity = await db
		.select({ userId: activities.userId })
		.from(activities)
		.where(eq(activities.id, params.id))
		.get();

	if (!activity) return json({ error: 'Not found' }, { status: 404 });
	if (activity.userId !== locals.user.userId && locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	await updateActivityPrivacy(db, params.id, parsed.data.isPrivate);
	return json({ ok: true });
}

export async function DELETE({ params, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(platform!.env.DB);
	const activity = await db
		.select({ userId: activities.userId })
		.from(activities)
		.where(eq(activities.id, params.id))
		.get();

	if (!activity) return json({ error: 'Not found' }, { status: 404 });
	if (activity.userId !== locals.user.userId && locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	await deleteActivity(db, params.id);
	return json({ ok: true });
}
