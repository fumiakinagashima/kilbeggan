import { getDb } from '$lib/server/db';
import { getOrgSetting } from '$lib/server/db/settings-service';

export async function load({ platform }) {
	const db = getDb(platform!.env.DB);
	const raw = await getOrgSetting(db, 'follow_up_days');
	return { followUpDays: raw ? parseInt(raw) : 30 };
}
