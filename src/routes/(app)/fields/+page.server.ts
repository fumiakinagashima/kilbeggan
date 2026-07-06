import { getDb } from '$lib/server/db';
import { listActivities } from '$lib/services/activity';
import { ACTIVITIES_PAGE_SIZE } from '$lib/constants';

export async function load({ platform, locals }) {
	const db = getDb(platform!.env.DB);
	const activities = await listActivities(db, ACTIVITIES_PAGE_SIZE, locals.user?.userId);
	return { activities };
}
