import { eq, sql } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { accounts } from '$lib/server/db/schema';

export type AccountSummary = {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'user';
	createdAt: Date;
};

export async function getAccountById(db: Db, id: string) {
	return db.select().from(accounts).where(eq(accounts.id, id)).get() ?? null;
}

export async function getAccountByEmail(db: Db, email: string) {
	return db.select().from(accounts).where(eq(accounts.email, email)).get() ?? null;
}

export async function listAccounts(db: Db): Promise<AccountSummary[]> {
	return db
		.select({
			id: accounts.id,
			email: accounts.email,
			name: accounts.name,
			role: accounts.role,
			createdAt: accounts.createdAt
		})
		.from(accounts)
		.orderBy(accounts.createdAt)
		.all();
}

export async function createAccount(
	db: Db,
	input: { name: string; email: string; role: 'admin' | 'user'; passwordHash: string }
): Promise<AccountSummary> {
	const id = crypto.randomUUID();
	const createdAt = new Date();
	await db.insert(accounts).values({ id, ...input, createdAt });
	return { id, name: input.name, email: input.email, role: input.role, createdAt };
}

export async function updateAccountRole(db: Db, id: string, role: 'admin' | 'user'): Promise<void> {
	await db.update(accounts).set({ role }).where(eq(accounts.id, id));
}

export async function deleteAccount(db: Db, id: string): Promise<void> {
	await db.delete(accounts).where(eq(accounts.id, id));
}

export async function countAdmins(db: Db): Promise<number> {
	const row = await db
		.select({ count: sql<number>`count(*)` })
		.from(accounts)
		.where(eq(accounts.role, 'admin'))
		.get();
	return row?.count ?? 0;
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
