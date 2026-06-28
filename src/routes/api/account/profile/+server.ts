import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { accounts } from '$lib/server/db/schema';
import { updateAccountProfile } from '$lib/server/db/account-service';
import { SESSION_COOKIE, updateSession } from '$lib/server/auth/session';

const schema = z.object({
	name: z.string().min(1),
	email: z.email()
});

export async function PATCH({ request, platform, locals, cookies }) {
	if (!locals.user) return json({ error: '未認証' }, { status: 401 });

	const body = await request.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return json({ error: '入力値が不正です' }, { status: 400 });

	const { name, email } = parsed.data;
	const db = getDb(platform!.env.DB);

	if (email !== locals.user.email) {
		const existing = await db.select().from(accounts).where(eq(accounts.email, email)).get();
		if (existing) return json({ error: 'このメールアドレスは既に使用されています' }, { status: 409 });
	}

	await updateAccountProfile(db, locals.user.userId, { name, email });

	const sessionId = cookies.get(SESSION_COOKIE);
	if (sessionId) {
		await updateSession(platform!.env.KV, sessionId, { name, email });
	}

	return json({ ok: true });
}
