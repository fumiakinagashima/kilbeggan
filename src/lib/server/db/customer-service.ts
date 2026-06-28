import { eq, desc, max } from 'drizzle-orm';
import type { Db } from './index';
import { customers, activityMentions, activities } from './schema';
import type { Customer } from './schema';

export async function listCustomers(db: Db) {
	return db.select().from(customers).orderBy(desc(customers.createdAt)).all();
}

export async function listCustomersWithLastActivity(
	db: Db
): Promise<Array<Customer & { lastActivityAt: Date | null }>> {
	const [all, lastActivities] = await Promise.all([
		db.select().from(customers).orderBy(desc(customers.createdAt)).all(),
		db
			.select({
				customerId: activityMentions.customerId,
				lastAt: max(activities.createdAt)
			})
			.from(activityMentions)
			.innerJoin(activities, eq(activityMentions.activityId, activities.id))
			.groupBy(activityMentions.customerId)
			.all()
	]);

	const lastMap = new Map<string, Date>();
	for (const row of lastActivities) {
		if (row.lastAt) {
			const d =
				row.lastAt instanceof Date
					? row.lastAt
					: new Date((row.lastAt as unknown as number) * 1000);
			lastMap.set(row.customerId, d);
		}
	}

	return all.map((c) => ({
		...c,
		lastActivityAt: lastMap.get(c.id) ?? null
	}));
}

export async function getCustomer(db: Db, id: string) {
	return db.select().from(customers).where(eq(customers.id, id)).get() ?? null;
}

export async function updateCustomer(
	db: Db,
	id: string,
	data: {
		company: string;
		phone?: string | null;
		email?: string | null;
		notes?: string | null;
	}
) {
	await db.update(customers).set({ ...data, updatedAt: new Date() }).where(eq(customers.id, id));
}

export async function updateCustomerSummary(
	db: Db,
	id: string,
	summary: string
): Promise<void> {
	await db
		.update(customers)
		.set({ aiSummary: summary, aiSummaryUpdatedAt: new Date() })
		.where(eq(customers.id, id));
}

export async function updateCustomerScore(
	db: Db,
	id: string,
	score: number
): Promise<void> {
	await db
		.update(customers)
		.set({ score, scoreUpdatedAt: new Date() })
		.where(eq(customers.id, id));
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
