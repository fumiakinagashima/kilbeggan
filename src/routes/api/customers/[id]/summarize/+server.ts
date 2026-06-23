import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getCustomer, updateCustomerSummary } from '$lib/server/db/customer-service';
import { listActivitiesByCustomer } from '$lib/server/db/activity-service';
import { summarizeCustomer } from '$lib/server/ai/summarize';

export async function POST({ params, platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) return json({ error: 'Not found' }, { status: 404 });
	const acts = await listActivitiesByCustomer(db, params.id);
	const summary = await summarizeCustomer(
		platform!.env.ANTHROPIC_API_KEY,
		customer.company,
		acts,
		platform?.env?.MOCK_AI
	);
	await updateCustomerSummary(db, params.id, summary);
	return json({ summary });
}
