import { ask } from './client';
import { stripCodeFence } from './json';

export const TAGS = [
	'Sales',
	'Complaint',
	'Information Gathering',
	'Follow-up',
	'Delivery & Support',
	'Internal Communication',
	'Other'
] as const;
export type Tag = (typeof TAGS)[number];

const SYSTEM = `You are an AI that classifies sales activities.
Read the given activity record text and choose the 1-3 most appropriate categories from the list below.

Categories:
- Sales: Activities related to deals, such as proposals, quotes, contracts, or negotiations
- Complaint: Complaints, issue reports, or complaint handling
- Information Gathering: Interviews, research, or information sharing
- Follow-up: Regular visits, check-ins, or relationship maintenance
- Delivery & Support: Product delivery, installation work, support, or technical assistance
- Internal Communication: Internal meetings, reports, or handovers
- Other: Activities that do not fit any of the above

Return only a JSON array, with no other text.
Example: ["Sales", "Follow-up"]`;

export async function classifyActivity(
	apiKey: string,
	body: string,
	mockAi?: string
): Promise<Tag[]> {
	if (mockAi) return ['Other'];

	try {
		const raw = await ask(apiKey, SYSTEM, body);
		const parsed = JSON.parse(stripCodeFence(raw)) as unknown;
		if (!Array.isArray(parsed)) return ['Other'];
		return parsed.filter((t): t is Tag => TAGS.includes(t as Tag));
	} catch {
		return ['Other'];
	}
}
