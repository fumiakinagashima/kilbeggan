import { ask } from './client';
import { stripCodeFence } from './json';

const SYSTEM = `You are a sales analysis AI.
Analyze the activity history with this customer and rate their "deal score" as an integer from 1 to 100.

Score bands:
- 80-100: Very Hot (deal actively progressing, strong purchase intent)
- 60-79: Hot (good relationship, positive response)
- 40-59: Warm (ongoing contact, wait-and-see)
- 20-39: Cool (little response, stalling)
- 1-19: Cold (no contact for a long time, risk of losing the relationship)

Points to consider:
- Days since last contact (the longer, the lower the score)
- Contact frequency (the higher, the higher the score)
- Tone of the activity content (deal progress/contracts are positive, complaints/issues are negative)

Return only JSON, with no other text.
{"score": <integer from 1 to 100>, "reason": "<reason, 40 characters or fewer>"}`;

type ScoreResult = { score: number; reason: string };

export async function scoreCustomer(
	apiKey: string,
	activities: { body: string; createdAt: Date; tags: string[] | null }[],
	mockAi?: string
): Promise<ScoreResult | null> {
	if (mockAi === 'true') return { score: 50, reason: 'Mock score' };
	if (activities.length === 0) return null;

	const now = new Date();
	const lines = activities.map((a) => {
		const daysAgo = Math.floor((now.getTime() - new Date(a.createdAt).getTime()) / 86_400_000);
		const tags = a.tags && a.tags.length > 0 ? `[${a.tags.join('/')}]` : '';
		return `${daysAgo} days ago ${tags}: ${a.body.slice(0, 200)}`;
	});

	const user = `Recent activity history (newest first):\n${lines.join('\n')}`;

	try {
		const raw = await ask(apiKey, SYSTEM, user);
		const parsed = JSON.parse(stripCodeFence(raw)) as unknown;
		if (typeof parsed !== 'object' || parsed === null) return null;
		const { score, reason } = parsed as Record<string, unknown>;
		if (typeof score !== 'number' || score < 1 || score > 100) return null;
		return { score: Math.round(score), reason: typeof reason === 'string' ? reason : '' };
	} catch {
		return null;
	}
}
