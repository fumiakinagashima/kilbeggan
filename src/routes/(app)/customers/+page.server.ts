import { getDb } from '$lib/server/db';
import { listCustomersWithLastActivity } from '$lib/services/customer';
import { getOrgSetting } from '$lib/services/settings';

export async function load({ platform }) {
	const db = getDb(platform!.env.DB);
	const [customers, raw] = await Promise.all([
		listCustomersWithLastActivity(db),
		getOrgSetting(db, 'follow_up_days')
	]);
	return { customers, followUpDays: raw ? parseInt(raw) : 30 };
}
