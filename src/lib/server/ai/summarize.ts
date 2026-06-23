import { ask } from './client';

const CUSTOMER_SYSTEM = `あなたは営業支援AIです。
顧客に関する活動記録の一覧を読み、以下の観点で簡潔な要約を作成してください。

- 現在の関係状況（良好・課題あり・要注意など）
- 直近の主なトピックや懸案事項
- 次のアクションとして推奨されること

200文字以内の日本語で記述してください。箇条書きは使わず、自然な文章で書いてください。`;

const TEAM_SYSTEM = `あなたは営業マネージャー支援AIです。
チームの活動記録を読み、マネージャー向けのサマリーを作成してください。

以下の観点でまとめてください:
- 期間中の活動の概況（件数・顧客数など）
- 主要なトピックや商談状況
- 注目すべき動向や懸念点
- 推奨される次のアクション

300文字以内の日本語で記述してください。`;

export async function summarizeCustomer(
	apiKey: string,
	company: string,
	activities: { body: string; createdAt: Date }[],
	mockAi?: string
): Promise<string> {
	if (mockAi) return `${company}との関係は良好です。直近の活動では情報収集や商談が中心でした。次のステップとして定期的なフォローアップを推奨します。（モック）`;
	if (activities.length === 0) return '';
	const lines = activities
		.slice(0, 20)
		.map((a) => `[${a.createdAt.toLocaleDateString('ja-JP')}] ${a.body}`)
		.join('\n');
	const prompt = `顧客名: ${company}\n\n活動記録:\n${lines}`;
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
	if (mockAi) return `直近7日間で${activities.length}件の活動が記録されました。商談や情報収集が中心で、チーム全体として積極的な顧客対応が行われています。引き続きフォローアップを継続することを推奨します。（モック）`;
	if (activities.length === 0) return '直近7日間に活動記録がありません。';
	const lines = activities
		.slice(0, 50)
		.map((a) => `[${a.createdAt.toLocaleDateString('ja-JP')} ${a.userName ?? ''}] ${a.body}`)
		.join('\n');
	const prompt = `活動件数: ${activities.length}件\n\n活動記録:\n${lines}`;
	try {
		return await ask(apiKey, TEAM_SYSTEM, prompt);
	} catch {
		return '';
	}
}
