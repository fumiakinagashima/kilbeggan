import type { Handle } from '@sveltejs/kit';
import { getSession, SESSION_COOKIE } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE);

	if (sessionId && event.platform?.env.KV) {
		event.locals.user = await getSession(event.platform.env.KV, sessionId);
	} else {
		event.locals.user = null;
	}

	return resolve(event);
};
