import { json } from '@sveltejs/kit';
import { destroySession, SESSION_COOKIE } from '$lib/server/auth/session';

export async function POST({ platform, cookies }) {
	const sessionId = cookies.get(SESSION_COOKIE);

	if (sessionId && platform?.env.kilbeggan) {
		await destroySession(platform.env.kilbeggan, sessionId);
	}

	cookies.delete(SESSION_COOKIE, { path: '/' });

	return json({ ok: true });
}
