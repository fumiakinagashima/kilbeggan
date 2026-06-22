import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getCustomer } from '$lib/server/db/customer-service';
import { listActivitiesByCustomer } from '$lib/server/db/activity-service';

export async function load({ params, platform, locals }) {
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) error(404, '顧客が見つかりません');

	const activities = await listActivitiesByCustomer(db, params.id, locals.user?.userId);
	return { customer, activities };
}
