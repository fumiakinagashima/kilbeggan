import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import {
	getAccountById,
	updateAccountRole,
	deleteAccount,
	countAdmins
} from '$lib/services/account';

const patchSchema = z.object({ role: z.enum(['admin', 'user']) });

export async function PATCH({ params, request, locals, platform }) {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const body = await request.json();
	const parsed = patchSchema.safeParse(body);
	if (!parsed.success) return json({ error: 'Invalid input' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	const target = await getAccountById(db, params.id);
	if (!target) return json({ error: 'Not found' }, { status: 404 });

	if (params.id === locals.user.userId) {
		return json({ error: 'You cannot change your own role' }, { status: 400 });
	}
	if (target.role === 'admin' && parsed.data.role === 'user') {
		const adminCount = await countAdmins(db);
		if (adminCount <= 1) {
			return json({ error: 'Cannot change the role of the last admin' }, { status: 400 });
		}
	}

	await updateAccountRole(db, params.id, parsed.data.role);
	return json({ ok: true });
}

export async function DELETE({ params, locals, platform }) {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const db = getDb(platform!.env.DB);
	const target = await getAccountById(db, params.id);
	if (!target) return json({ error: 'Not found' }, { status: 404 });

	if (params.id === locals.user.userId) {
		return json({ error: 'You cannot delete your own account' }, { status: 400 });
	}
	if (target.role === 'admin') {
		const adminCount = await countAdmins(db);
		if (adminCount <= 1) {
			return json({ error: 'Cannot delete the last admin' }, { status: 400 });
		}
	}

	await deleteAccount(db, params.id);
	return json({ ok: true });
}
