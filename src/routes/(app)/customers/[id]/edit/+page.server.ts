import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { getCustomer, updateCustomer } from '$lib/server/db/customer-service';

export async function load({ params, platform }) {
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) error(404, '顧客が見つかりません');
	return { customer };
}

const updateSchema = z.object({
	company: z.string().min(1),
	phone: z.string().optional().nullable(),
	email: z.string().optional().nullable(),
	notes: z.string().optional().nullable()
});

export const actions = {
	default: async ({ request, platform, params }) => {
		const db = getDb(platform!.env.DB);
		const customer = await getCustomer(db, params.id);
		if (!customer) error(404);

		const formData = await request.formData();
		const raw = {
			company: formData.get('company') as string,
			phone: (formData.get('phone') as string) || null,
			email: (formData.get('email') as string) || null,
			notes: (formData.get('notes') as string) || null
		};
		const parsed = updateSchema.safeParse(raw);
		if (!parsed.success) {
			const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
			console.error('[customer edit] validation failed:', JSON.stringify(raw), details);
			return { error: `入力値が不正です (${details})` };
		}

		await updateCustomer(db, params.id, parsed.data);
		redirect(302, `/customers/${params.id}`);
	}
};
