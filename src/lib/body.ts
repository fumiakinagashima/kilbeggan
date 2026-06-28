export type BodySegment =
	| { type: 'text'; text: string }
	| { type: 'mention'; name: string; id: string };

// @{id} 形式（新）と @[name](id) 形式（旧・後方互換）の両方にマッチ
const MENTION_RE = /@\{([^}]+)\}|@\[([^\]]+)\]\(([^)]+)\)/g;

function parseSegments(body: string, mentionMap: Map<string, string>): BodySegment[] {
	const segments: BodySegment[] = [];
	let lastIndex = 0;
	let match;
	const re = new RegExp(MENTION_RE.source, 'g');

	while ((match = re.exec(body)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ type: 'text', text: body.slice(lastIndex, match.index) });
		}
		if (match[1] !== undefined) {
			// 新フォーマット: @{id}
			const id = match[1];
			segments.push({ type: 'mention', id, name: mentionMap.get(id) ?? id });
		} else {
			// 旧フォーマット: @[name](id)
			const id = match[3];
			segments.push({ type: 'mention', id, name: mentionMap.get(id) ?? match[2] });
		}
		lastIndex = re.lastIndex;
	}

	if (lastIndex < body.length) {
		segments.push({ type: 'text', text: body.slice(lastIndex) });
	}
	return segments;
}

export function parseBody(body: string, mentionMap: Map<string, string> = new Map()): BodySegment[] {
	return parseSegments(body, mentionMap);
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export function bodyToHtml(body: string, mentionMap: Map<string, string> = new Map()): string {
	return parseSegments(body, mentionMap)
		.map((seg) =>
			seg.type === 'text'
				? escapeHtml(seg.text).replace(/\n/g, '<br>')
				: `<span class="mention">@${escapeHtml(seg.name)}</span>`
		)
		.join('');
}

export function bodyToEditorHtml(body: string, mentionMap: Map<string, string> = new Map()): string {
	// Chrome normalizes <br> in contenteditable to <div><br></div>, causing double newlines.
	// Use <div> per line to match Chrome's native structure.
	return body.split('\n').map((line) => {
		const lineHtml = parseSegments(line, mentionMap)
			.map((seg) =>
				seg.type === 'text'
					? escapeHtml(seg.text)
					: `<span class="inline-mention" contenteditable="false" data-mention-id="${escapeAttr(seg.id)}" data-mention-name="${escapeAttr(seg.name)}">@${escapeHtml(seg.name)}</span>`
			)
			.join('');
		return `<div>${lineHtml || '<br>'}</div>`;
	}).join('');
}

export function parseMentionIds(body: string): string[] {
	const ids: string[] = [];
	const re = new RegExp(MENTION_RE.source, 'g');
	let match;
	while ((match = re.exec(body)) !== null) {
		ids.push(match[1] ?? match[3]);
	}
	return [...new Set(ids)];
}
