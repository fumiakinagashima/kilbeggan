import { eq } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { orgSettings } from '$lib/server/db/schema';

export async function getOrgSetting(db: Db, key: string): Promise<string | null> {
	const row = await db.select().from(orgSettings).where(eq(orgSettings.key, key)).get();
	return row?.value ?? null;
}

export async function setOrgSetting(
	db: Db,
	key: string,
	value: string,
	updatedBy: string
): Promise<void> {
	const now = new Date();
	await db
		.insert(orgSettings)
		.values({ key, value, updatedAt: now, updatedBy })
		.onConflictDoUpdate({
			target: orgSettings.key,
			set: { value, updatedAt: now, updatedBy }
		});
}
