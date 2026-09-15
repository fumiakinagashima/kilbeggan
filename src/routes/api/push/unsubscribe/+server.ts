import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { deletePushSubscription } from '$lib/services/push-subscription';

const schema = z.object({ endpoint: z.string().min(1) });

export async function POST({ request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return json({ error: 'Invalid input' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	await deletePushSubscription(db, parsed.data.endpoint);
	return json({ ok: true });
}
