import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { listAccounts } from '$lib/services/account';

export async function load({ locals, platform }) {
	if (!locals.user || locals.user.role !== 'admin') {
		redirect(302, '/');
	}

	const db = getDb(platform!.env.DB);
	const accounts = await listAccounts(db);
	return { accounts };
}
