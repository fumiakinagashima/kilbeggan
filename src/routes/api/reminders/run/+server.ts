import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { processDueReminders } from '$lib/server/reminders/delivery';

export async function POST({ platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(platform!.env.DB);
	const results = await processDueReminders(db, platform!.env);
	return json({ results });
}
