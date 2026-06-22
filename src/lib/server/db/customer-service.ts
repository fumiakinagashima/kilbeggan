import { eq, desc } from 'drizzle-orm';
import type { Db } from './index';
import { customers } from './schema';

export async function listCustomers(db: Db) {
	return db.select().from(customers).orderBy(desc(customers.createdAt)).all();
}

export async function getCustomer(db: Db, id: string) {
	return db.select().from(customers).where(eq(customers.id, id)).get() ?? null;
}

export async function createCustomer(
	db: Db,
	data: {
		company: string;
		phone?: string | null;
		email?: string | null;
		notes?: string | null;
		createdBy: string;
	}
) {
	const id = crypto.randomUUID();
	const now = new Date();
	await db.insert(customers).values({
		id,
		company: data.company,
		phone: data.phone ?? null,
		email: data.email ?? null,
		notes: data.notes ?? null,
		createdBy: data.createdBy,
		createdAt: now,
		updatedAt: now
	});
	return id;
}
