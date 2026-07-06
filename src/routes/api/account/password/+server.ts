import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { getAccountById, updateAccountPassword } from '$lib/services/account';
import { verifyPassword, hashPassword } from '$lib/server/auth/password';

const schema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8),
	confirmPassword: z.string().min(1)
});

export async function POST({ request, platform, locals }) {
	if (!locals.user) return json({ error: '未認証' }, { status: 401 });

	const body = await request.json();
	const parsed = schema.safeParse(body);
	if (!parsed.success) return json({ error: '入力値が不正です' }, { status: 400 });

	const { currentPassword, newPassword, confirmPassword } = parsed.data;
	if (newPassword !== confirmPassword) {
		return json({ error: '新しいパスワードが一致しません' }, { status: 400 });
	}

	const db = getDb(platform!.env.DB);
	const account = await getAccountById(db, locals.user.userId);
	if (!account) return json({ error: 'アカウントが見つかりません' }, { status: 404 });

	const valid = await verifyPassword(currentPassword, account.passwordHash);
	if (!valid) return json({ error: '現在のパスワードが正しくありません' }, { status: 401 });

	await updateAccountPassword(db, locals.user.userId, await hashPassword(newPassword));

	return json({ ok: true });
}
