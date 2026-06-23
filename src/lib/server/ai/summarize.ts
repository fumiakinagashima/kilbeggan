import { ask } from './client';

const SYSTEM = `あなたは営業支援AIです。
顧客に関する活動記録の一覧を読み、以下の観点で簡潔な要約を作成してください。

- 現在の関係状況（良好・課題あり・要注意など）
- 直近の主なトピックや懸案事項
- 次のアクションとして推奨されること

200文字以内の日本語で記述してください。箇条書きは使わず、自然な文章で書いてください。`;

export async function summarizeCustomer(
	apiKey: string,
	company: string,
	activities: { body: string; createdAt: Date }[],
	mockAi?: string
): Promise<string> {
	if (mockAi) return `${company}との関係は良好です。（モック）`;

	if (activities.length === 0) return '';

	const lines = activities
		.slice(0, 20)
		.map((a) => `[${a.createdAt.toLocaleDateString('ja-JP')}] ${a.body}`)
		.join('\n');

	const prompt = `顧客名: ${company}\n\n活動記録:\n${lines}`;

	try {
		return await ask(apiKey, SYSTEM, prompt);
	} catch {
		return '';
	}
}
