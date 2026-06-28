import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getCustomer, updateCustomerScore } from '$lib/server/db/customer-service';
import { listActivitiesByCustomer } from '$lib/server/db/activity-service';
import { scoreCustomer } from '$lib/server/ai/score';

export async function POST({ params, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) return json({ error: 'Not found' }, { status: 404 });

	const acts = await listActivitiesByCustomer(db, params.id, locals.user.id);
	const result = await scoreCustomer(
		platform!.env.ANTHROPIC_API_KEY,
		acts.map((a) => ({ body: a.body, createdAt: a.createdAt, tags: a.tags })),
		platform?.env?.MOCK_AI
	);

	if (!result) return json({ error: 'スコアを計算できませんでした' }, { status: 422 });

	await updateCustomerScore(db, params.id, result.score);
	return json({ score: result.score, reason: result.reason });
}
