import { ask } from './client';

export const TAGS = ['商談', 'クレーム', '情報収集', 'フォローアップ', '納品・対応', '社内連絡', 'その他'] as const;
export type Tag = (typeof TAGS)[number];

const SYSTEM = `あなたは営業活動の分類AIです。
与えられた活動記録テキストを読み、以下のカテゴリのうち最も適切なものを1〜3個選んでください。

カテゴリ:
- 商談: 提案・見積・契約・交渉など商談に関する活動
- クレーム: 苦情・問題報告・クレーム対応
- 情報収集: ヒアリング・調査・情報共有
- フォローアップ: 定期訪問・確認・関係維持
- 納品・対応: 製品納品・工事・サポート・技術対応
- 社内連絡: 社内会議・報告・引き継ぎ
- その他: 上記に当てはまらない活動

必ずJSON配列のみを返してください。説明文は不要です。
例: ["商談", "フォローアップ"]`;

export async function classifyActivity(
	apiKey: string,
	body: string,
	mockAi?: string
): Promise<Tag[]> {
	if (mockAi) return ['その他'];

	try {
		const raw = await ask(apiKey, SYSTEM, body);
		const parsed = JSON.parse(raw.trim()) as unknown;
		if (!Array.isArray(parsed)) return ['その他'];
		return parsed.filter((t): t is Tag => TAGS.includes(t as Tag));
	} catch {
		return ['その他'];
	}
}
