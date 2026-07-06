import { redirect } from '@sveltejs/kit';

const PUBLIC = ['/signin'];

export function load({ locals, url, platform }) {
	if (!locals.user && !PUBLIC.includes(url.pathname)) {
		redirect(302, '/signin');
	}

	return { user: locals.user, vapidPublicKey: platform?.env.VAPID_PUBLIC_KEY ?? null };
}
