import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { listActivities } from '$lib/services/activity';
import { summarizeTeam } from '$lib/server/ai/summarize';

export async function POST({ platform, locals }) {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const db = getDb(platform!.env.DB);
	const all = await listActivities(db, 100);
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const recent = all.filter((a) => new Date(a.createdAt) >= sevenDaysAgo);
	const summary = await summarizeTeam(
		platform!.env.ANTHROPIC_API_KEY,
		recent,
		platform?.env?.MOCK_AI
	);
	const updatedAt = new Date().toISOString();
	await platform!.env.kilbeggan.put('dashboard:team_summary', JSON.stringify({ summary, updatedAt }));
	return json({ summary, updatedAt });
}
