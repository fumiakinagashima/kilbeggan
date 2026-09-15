import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getCustomer, updateManagerComment } from '$lib/services/customer';

export async function POST({ params, platform, locals, request }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) return json({ error: 'Not found' }, { status: 404 });
	const { comment } = (await request.json()) as { comment: string };
	if (typeof comment !== 'string') {
		return json({ error: 'Invalid comment' }, { status: 400 });
	}
	await updateManagerComment(db, params.id, comment.trim(), locals.user.name);
	return json({ comment: comment.trim(), editedBy: locals.user.name });
}
