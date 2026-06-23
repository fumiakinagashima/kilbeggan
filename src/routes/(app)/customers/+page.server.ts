import { getDb } from '$lib/server/db';
import { listCustomersWithLastActivity } from '$lib/server/db/customer-service';

export async function load({ platform }) {
	const db = getDb(platform!.env.DB);
	const customers = await listCustomersWithLastActivity(db);
	return { customers };
}
