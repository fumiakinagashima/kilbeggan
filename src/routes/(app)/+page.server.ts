import { getDb } from '$lib/server/db';
import { listActivities } from '$lib/server/db/activity-service';
import { listCustomers } from '$lib/server/db/customer-service';

export async function load({ platform }) {
	const db = getDb(platform!.env.DB);
	const [activities, customers] = await Promise.all([listActivities(db), listCustomers(db)]);
	return { activities, customers };
}
