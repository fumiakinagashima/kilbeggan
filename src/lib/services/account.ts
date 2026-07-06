import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { accounts } from '$lib/server/db/schema';

export async function getAccountById(db: Db, id: string) {
	return db.select().from(accounts).where(eq(accounts.id, id)).get() ?? null;
}

export async function updateAccountProfile(
	db: Db,
	id: string,
	data: { name: string; email: string }
) {
	await db.update(accounts).set(data).where(eq(accounts.id, id));
}

export async function updateAccountPassword(db: Db, id: string, passwordHash: string) {
	await db.update(accounts).set({ passwordHash }).where(eq(accounts.id, id));
}
