import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { createAccount, getAccountByEmail } from '$lib/services/account';
import { hashPassword } from '$lib/server/auth/password';

const createSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(8),
	role: z.enum(['admin', 'user'])
});

export async function POST({ request, locals, platform }) {
	if (!locals.user || locals.user.role !== 'admin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const body = await request.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return json({ error: '入力値が不正です' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	const existing = await getAccountByEmail(db, parsed.data.email);
	if (existing) return json({ error: 'このメールアドレスは既に使用されています' }, { status: 409 });

	const passwordHash = await hashPassword(parsed.data.password);
	const account = await createAccount(db, {
		name: parsed.data.name,
		email: parsed.data.email,
		role: parsed.data.role,
		passwordHash
	});
	return json({ account }, { status: 201 });
}
