import { getDb } from '$lib/server/db';
import { listActivities } from '$lib/server/db/activity-service';

export async function load({ platform, locals }) {
	const db = getDb(platform!.env.DB);
	const activities = await listActivities(db, 50, locals.user?.userId);
	return { activities };
}
