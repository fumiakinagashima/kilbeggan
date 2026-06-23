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

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function bodyToHtml(body: string): string {
	const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
	let result = '';
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(body)) !== null) {
		if (match.index > lastIndex) {
			result += escapeHtml(body.slice(lastIndex, match.index)).replace(/\n/g, '<br>');
		}
		result += `<span class="mention">@${escapeHtml(match[1])}</span>`;
		lastIndex = regex.lastIndex;
	}

	if (lastIndex < body.length) {
		result += escapeHtml(body.slice(lastIndex)).replace(/\n/g, '<br>');
	}

	return result;
}

function escapeAttr(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export function bodyToEditorHtml(body: string): string {
	const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
	let result = '';
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(body)) !== null) {
		if (match.index > lastIndex) {
			result += escapeHtml(body.slice(lastIndex, match.index)).replace(/\n/g, '<br>');
		}
		const name = match[1];
		const id = match[2];
		result += `<span class="inline-mention" contenteditable="false" data-mention-id="${escapeAttr(id)}" data-mention-name="${escapeAttr(name)}">@${escapeHtml(name)}</span>`;
		lastIndex = regex.lastIndex;
	}

	if (lastIndex < body.length) {
		result += escapeHtml(body.slice(lastIndex)).replace(/\n/g, '<br>');
	}

	return result;
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
