import { json } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { listCustomers, createCustomer } from '$lib/server/db/customer-service';

const createSchema = z.object({
	company: z.string().min(1),
	phone: z.string().optional(),
	email: z.string().optional(),
	notes: z.string().optional()
});

export async function GET({ platform }) {
	const db = getDb(platform!.env.DB);
	const data = await listCustomers(db);
	return json(data);
}

export async function POST({ request, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json();
	const parsed = createSchema.safeParse(body);
	if (!parsed.success) return json({ error: '入力値が不正です' }, { status: 400 });

	const db = getDb(platform!.env.DB);
	const id = await createCustomer(db, { ...parsed.data, createdBy: locals.user.userId });
	return json({ id }, { status: 201 });
}
