import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getNotification, markNotificationRead } from '$lib/services/notification';

export async function PATCH({ params, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(platform!.env.DB);
	const notification = await getNotification(db, params.id);
	if (!notification) return json({ error: 'Not found' }, { status: 404 });
	if (notification.userId !== locals.user.userId)
		return json({ error: 'Forbidden' }, { status: 403 });

	await markNotificationRead(db, params.id);
	return json({ ok: true });
}
