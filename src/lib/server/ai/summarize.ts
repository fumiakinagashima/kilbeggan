import { ask } from './client';

const CUSTOMER_SYSTEM = `You are a sales support AI.
Read the list of activity records for this customer and produce a medium-to-long-term analysis covering the following points.

- The customer's characteristics, interests, and values (what type of person they are and what they prioritize)
- The depth of the relationship and its current phase (initial contact, building trust, deepening the deal, etc.)
- An effective approach (what resonates with them, what angle works)

Write in English, within 200 characters. Do not use bullet points; write in natural prose.`;

const TEAM_SYSTEM = `You are an AI that supports sales managers.
Read the team's activity records and produce a summary for the manager.

Cover the following points:
- Overview of activity during the period (number of activities, number of customers, etc.)
- Key topics and the state of ongoing deals
- Notable trends or concerns
- Recommended next actions

Write in English, within 300 characters.`;

export async function summarizeCustomer(
	apiKey: string,
	company: string,
	activities: { body: string; createdAt: Date }[],
	mockAi?: string
): Promise<string> {
	if (mockAi === 'true')
		return `${company} is a hands-on contact who prioritizes quality and cost reduction. The relationship is in the trust-building phase, and an approach backed by concrete figures and case studies tends to resonate. (Mock)`;
	if (activities.length === 0) return '';
	const lines = activities
		.slice(0, 20)
		.map((a) => `[${a.createdAt.toLocaleDateString('en-US')}] ${a.body}`)
		.join('\n');
	const prompt = `Customer name: ${company}\n\nActivity records:\n${lines}`;
	try {
		return await ask(apiKey, CUSTOMER_SYSTEM, prompt);
	} catch {
		return '';
	}
}

export async function summarizeTeam(
	apiKey: string,
	activities: { body: string; createdAt: Date; userName?: string | null }[],
	mockAi?: string
): Promise<string> {
	if (mockAi)
		return `${activities.length} activities were recorded over the past 7 days. Sales and information-gathering activities made up the bulk of them, and the team as a whole has been proactive in customer engagement. It is recommended to keep up follow-up activities going forward. (Mock)`;
	if (activities.length === 0) return 'No activities were recorded in the past 7 days.';
	const lines = activities
		.slice(0, 50)
		.map((a) => `[${a.createdAt.toLocaleDateString('en-US')} ${a.userName ?? ''}] ${a.body}`)
		.join('\n');
	const prompt = `Number of activities: ${activities.length}\n\nActivity records:\n${lines}`;
	try {
		return await ask(apiKey, TEAM_SYSTEM, prompt);
	} catch {
		return '';
	}
}
