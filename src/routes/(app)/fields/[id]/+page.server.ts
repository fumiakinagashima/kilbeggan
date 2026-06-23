import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod/v4';
import { getDb } from '$lib/server/db';
import { getActivity, updateActivity } from '$lib/server/db/activity-service';
import { listCustomers } from '$lib/server/db/customer-service';
import { parseMentionIds } from '$lib/body';

export async function load({ params, platform, locals }) {
	const db = getDb(platform!.env.DB);
	const [activity, customers] = await Promise.all([
		getActivity(db, params.id),
		listCustomers(db)
	]);
	if (!activity) error(404, '活動が見つかりません');
	if (activity.userId !== locals.user!.userId) error(403, '編集権限がありません');
	return { activity, customers };
}

const attachmentSchema = z.object({ key: z.string(), name: z.string() });
const updateSchema = z.object({
	body: z.string().min(1),
	isPrivate: z.boolean(),
	attachments: z.array(attachmentSchema).optional().default([])
});

export const actions = {
	default: async ({ request, platform, locals, params }) => {
		const db = getDb(platform!.env.DB);
		const activity = await getActivity(db, params.id);
		if (!activity) error(404);
		if (activity.userId !== locals.user!.userId) error(403);

		const formData = await request.formData();
		let attachmentsParsed: unknown = [];
		try {
			attachmentsParsed = JSON.parse((formData.get('attachments') as string | null) ?? '[]');
		} catch {
			attachmentsParsed = [];
		}
		const parsed = updateSchema.safeParse({
			body: formData.get('body'),
			isPrivate: formData.get('isPrivate') === 'true',
			attachments: attachmentsParsed
		});
		if (!parsed.success) return { error: '入力値が不正です' };

		const mentionedCustomerIds = parseMentionIds(parsed.data.body);
		await updateActivity(db, params.id, { ...parsed.data, mentionedCustomerIds });
		redirect(302, '/fields');
	}
};
