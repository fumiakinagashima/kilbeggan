import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { eq } from 'drizzle-orm';
import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { verifyPassword } from '$lib/server/auth/password';
import { createSession, SESSION_COOKIE, SESSION_TTL_SECONDS } from '$lib/server/auth/session';

const schema = z.object({
	email: z.email(),
	password: z.string().min(1)
});

export async function POST({ request, platform, cookies }) {
	const body = await request.json();
	const parsed = schema.safeParse(body);

	if (!parsed.success) {
		return json({ error: '入力値が不正です' }, { status: 400 });
	}

	const { email, password } = parsed.data;
	const db = getDb(platform!.env.DB);

	const user = await db.select().from(users).where(eq(users.email, email)).get();

	if (!user || !(await verifyPassword(password, user.passwordHash))) {
		return json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 });
	}

	const sessionId = await createSession(platform!.env.KV, {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role
	});

	cookies.set(SESSION_COOKIE, sessionId, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: SESSION_TTL_SECONDS,
		path: '/'
	});

	return json({ ok: true });
}
