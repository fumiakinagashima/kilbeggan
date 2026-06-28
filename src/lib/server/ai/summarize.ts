import { ask } from './client';

const CUSTOMER_SYSTEM = `あなたは営業支援AIです。
顧客に関する活動記録の一覧を読み、以下の観点で中〜長期的な分析を作成してください。

- 顧客の特性・関心・価値観（何を重視するタイプか）
- 関係性の深さと現在のフェーズ（初期接触・信頼構築中・商談深耕など）
- 効果的なアプローチ（何が刺さるか、どんな切り口が響くか）

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
	if (mockAi === 'true') return `${company}は品質とコスト削減を重視する実務型の担当者。関係性は信頼構築フェーズで、具体的な数値・事例を示すアプローチが刺さりやすい。（モック）`;
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
