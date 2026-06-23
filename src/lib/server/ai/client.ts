import Anthropic from '@anthropic-ai/sdk';

export function createClient(apiKey: string): Anthropic {
	return new Anthropic({ apiKey });
}

export async function ask(
	apiKey: string,
	system: string,
	user: string,
	model = 'claude-haiku-4-5-20251001'
): Promise<string> {
	const client = createClient(apiKey);
	const response = await client.messages.create({
		model,
		max_tokens: 1024,
		system,
		messages: [{ role: 'user', content: user }]
	});
	const block = response.content[0];
	return block.type === 'text' ? block.text : '';
}
