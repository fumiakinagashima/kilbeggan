import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { countUnreadNotifications } from '$lib/services/notification';

export async function GET({ platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(platform!.env.DB);
	const unreadCount = await countUnreadNotifications(db, locals.user.userId);
	return json({ unreadCount });
}
