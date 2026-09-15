import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { setOrgSetting } from '$lib/services/settings';

const schema = z.object({
	key: z.string().min(1),
	value: z.string().min(1)
});

export async function PATCH({ request, platform, locals }) {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const body = await request.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return json({ error: 'Invalid input' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	await setOrgSetting(db, parsed.data.key, parsed.data.value, locals.user.userId);
	return json({ ok: true });
}
