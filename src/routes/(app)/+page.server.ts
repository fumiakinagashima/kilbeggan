import { getDb } from '$lib/server/db';
import { listCustomers } from '$lib/services/customer';

export async function load({ platform }) {
	const db = getDb(platform!.env.DB);
	const customers = await listCustomers(db);
	return { customers };
}
