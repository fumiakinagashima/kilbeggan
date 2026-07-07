// ClaudeはJSON形式のみ返すよう指示しても、```json ... ``` のようにMarkdownコードフェンスで
// 囲んで返すことがある。そのままJSON.parseすると失敗するため、パース前にフェンスを取り除く。
export function stripCodeFence(raw: string): string {
	const trimmed = raw.trim();
	const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
	return match ? match[1] : trimmed;
}
