import { ask } from './client';

const SYSTEM = `あなたは営業分析AIです。
顧客との活動履歴を分析し、この顧客の「商談スコア」を1〜100の整数で評価してください。

スコア基準:
- 80〜100: 非常にホット（積極的な商談進行・強い購入意欲）
- 60〜79: ホット（良好な関係・前向きな反応）
- 40〜59: ウォーム（接触継続中・様子見）
- 20〜39: クール（反応薄い・停滞気味）
- 1〜19: コールド（長期未接触・関係断絶リスク）

評価のポイント:
- 最終接触からの経過日数（長いほど低下）
- 接触頻度（高いほど上昇）
- 活動内容のトーン（商談進展・契約はプラス、クレーム・問題はマイナス）

必ずJSON形式のみを返してください。説明文は不要です。
{"score": <1〜100の整数>, "reason": "<40文字以内の理由>"}`;

type ScoreResult = { score: number; reason: string };

export async function scoreCustomer(
	apiKey: string,
	activities: { body: string; createdAt: Date; tags: string[] | null }[],
	mockAi?: string
): Promise<ScoreResult | null> {
	if (mockAi === 'true') return { score: 50, reason: 'モックスコア' };
	if (activities.length === 0) return null;

	const now = new Date();
	const lines = activities.map((a) => {
		const daysAgo = Math.floor((now.getTime() - new Date(a.createdAt).getTime()) / 86_400_000);
		const tags = a.tags && a.tags.length > 0 ? `[${a.tags.join('/')}]` : '';
		return `${daysAgo}日前 ${tags}: ${a.body.slice(0, 200)}`;
	});

	const user = `直近の活動履歴（新しい順）:\n${lines.join('\n')}`;

	try {
		const raw = await ask(apiKey, SYSTEM, user);
		const parsed = JSON.parse(raw.trim()) as unknown;
		if (typeof parsed !== 'object' || parsed === null) return null;
		const { score, reason } = parsed as Record<string, unknown>;
		if (typeof score !== 'number' || score < 1 || score > 100) return null;
		return { score: Math.round(score), reason: typeof reason === 'string' ? reason : '' };
	} catch {
		return null;
	}
}
