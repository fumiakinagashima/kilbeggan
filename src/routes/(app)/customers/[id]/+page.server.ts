import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getCustomer } from '$lib/services/customer';
import { listActivitiesByCustomer } from '$lib/services/activity';

export async function load({ params, platform, locals }) {
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) error(404, 'Customer not found');

	const activities = await listActivitiesByCustomer(db, params.id, locals.user?.userId);
	return { customer, activities };
}
