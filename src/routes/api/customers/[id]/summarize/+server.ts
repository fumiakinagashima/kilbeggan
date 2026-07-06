import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getCustomer, updateCustomerSummary, editCustomerSummary } from '$lib/services/customer';
import { listActivitiesByCustomer } from '$lib/services/activity';
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

export async function PATCH({ params, platform, locals, request }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const db = getDb(platform!.env.DB);
	const customer = await getCustomer(db, params.id);
	if (!customer) return json({ error: 'Not found' }, { status: 404 });
	const { summary } = await request.json() as { summary: string };
	if (typeof summary !== 'string' || summary.trim() === '') {
		return json({ error: 'Invalid summary' }, { status: 400 });
	}
	await editCustomerSummary(db, params.id, summary.trim(), locals.user.name);
	return json({ summary: summary.trim(), editedBy: locals.user.name });
}
