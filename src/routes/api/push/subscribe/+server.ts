import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { upsertPushSubscription } from '$lib/services/push-subscription';

const schema = z.object({
	endpoint: z.string().min(1),
	keys: z.object({
		p256dh: z.string().min(1),
		auth: z.string().min(1)
	})
});

export async function POST({ request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return json({ error: '入力値が不正です' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	await upsertPushSubscription(db, {
		userId: locals.user.userId,
		endpoint: parsed.data.endpoint,
		p256dh: parsed.data.keys.p256dh,
		auth: parsed.data.keys.auth
	});
	return json({ ok: true });
}
