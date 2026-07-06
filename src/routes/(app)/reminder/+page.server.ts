import { getDb } from '$lib/server/db';
import { listReminders, getReminderChannelOptions } from '$lib/services/reminder';

export async function load({ platform, locals }) {
	const db = getDb(platform!.env.DB);
	const rows = await listReminders(db, locals.user!.userId);
	const channelOptions = getReminderChannelOptions(platform!.env);
	return { rows, channelOptions };
}
