import { json } from '@sveltejs/kit';
import { destroySession, SESSION_COOKIE } from '$lib/server/auth/session';

export async function POST({ platform, cookies }) {
	const sessionId = cookies.get(SESSION_COOKIE);

	if (sessionId && platform?.env.KV) {
		await destroySession(platform.env.KV, sessionId);
	}

	cookies.delete(SESSION_COOKIE, { path: '/' });

	return json({ ok: true });
}
