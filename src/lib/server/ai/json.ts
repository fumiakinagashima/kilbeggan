// Even when instructed to return only JSON, Claude sometimes wraps the response in a
// Markdown code fence like ```json ... ```. Parsing that directly with JSON.parse would
// fail, so strip the fence before parsing.
export function stripCodeFence(raw: string): string {
	const trimmed = raw.trim();
	const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
	return match ? match[1] : trimmed;
}
