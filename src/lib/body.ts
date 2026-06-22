export type BodySegment =
	| { type: 'text'; text: string }
	| { type: 'mention'; name: string; id: string };

export function parseBody(body: string): BodySegment[] {
	const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
	const segments: BodySegment[] = [];
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(body)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ type: 'text', text: body.slice(lastIndex, match.index) });
		}
		segments.push({ type: 'mention', name: match[1], id: match[2] });
		lastIndex = regex.lastIndex;
	}

	if (lastIndex < body.length) {
		segments.push({ type: 'text', text: body.slice(lastIndex) });
	}

	return segments;
}

export function parseMentionIds(body: string): string[] {
	const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
	const ids: string[] = [];
	let match;
	while ((match = regex.exec(body)) !== null) {
		ids.push(match[2]);
	}
	return [...new Set(ids)];
}
