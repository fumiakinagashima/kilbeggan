import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getCustomer } from '$lib/services/customer';

export async function GET({ params, platform }) {
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) return json({ error: 'Not found' }, { status: 404 });
	return json(customer);
}
