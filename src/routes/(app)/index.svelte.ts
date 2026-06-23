import type { PageData } from './$types';
import { compressImage } from '$lib/image';

type CustomerOption = { id: string; company: string };
type AttachmentItem = { key: string; url: string; name: string; mimeType: string };

export function createComposeState(getData: () => PageData) {
	let posting = $state(false);
	let postError = $state('');
	let hasContent = $state(false);
	let isPrivate = $state(false);
	let attachments = $state<AttachmentItem[]>([]);
	let uploading = $state(false);
	let editorEl = $state<HTMLDivElement | undefined>(undefined);
	let isComposing = $state(false);
	let mentionQuery = $state('');
	let mentionRange: Range | null = null;
	let showDropdown = $state(false);

	const filteredCustomers = $derived<CustomerOption[]>(
		showDropdown
			? getData()
					.customers.filter(
						(c: CustomerOption) =>
							!mentionQuery || c.company.toLowerCase().includes(mentionQuery.toLowerCase())
					)
					.slice(0, 6)
			: []
	);

	function extractText(node: Node, isRoot: boolean): string {
		let result = '';
		for (const child of node.childNodes) {
			if (child.nodeType === Node.TEXT_NODE) {
				result += child.textContent ?? '';
			} else if (child instanceof HTMLElement) {
				if (child.dataset.mentionId) {
					result += `@{${child.dataset.mentionId}}`;
				} else if (child.tagName === 'BR') {
					result += '\n';
				} else if (!isRoot && (child.tagName === 'DIV' || child.tagName === 'P')) {
					result += '\n' + extractText(child, false);
				} else {
					result += extractText(child, false);
				}
			}
		}
		return result;
	}

	function getBodyText(): string {
		if (!editorEl) return '';
		return extractText(editorEl, true);
	}

	function checkMention() {
		const sel = window.getSelection();
		if (!sel || !sel.rangeCount) {
			showDropdown = false;
			return;
		}
		const range = sel.getRangeAt(0);
		const node = range.startContainer;
		if (node.nodeType !== Node.TEXT_NODE) {
			showDropdown = false;
			return;
		}
		const before = (node.textContent ?? '').slice(0, range.startOffset);
		const match = before.match(/@([^@\n]*)$/);
		if (match && !match[1].startsWith('[')) {
			mentionQuery = match[1];
			const r = document.createRange();
			r.setStart(node, range.startOffset - match[0].length);
			r.setEnd(node, range.startOffset);
			mentionRange = r;
			showDropdown = true;
		} else {
			showDropdown = false;
			mentionRange = null;
		}
	}

	function handleEditorInput() {
		hasContent = (editorEl?.textContent?.trim().length ?? 0) > 0;
		if (!isComposing) checkMention();
	}

	function handleCompositionStart() {
		isComposing = true;
	}

	function handleCompositionEnd() {
		isComposing = false;
		checkMention();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !isComposing) {
			e.preventDefault();
			const sel = window.getSelection();
			if (!sel?.rangeCount) return;
			const range = sel.getRangeAt(0);
			range.deleteContents();
			const br = document.createElement('br');
			range.insertNode(br);
			const newRange = document.createRange();
			newRange.setStartAfter(br);
			newRange.collapse(true);
			sel.removeAllRanges();
			sel.addRange(newRange);
			hasContent = true;
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain') ?? '';
		const sel = window.getSelection();
		if (sel?.rangeCount) {
			const range = sel.getRangeAt(0);
			range.deleteContents();
			const textNode = document.createTextNode(text);
			range.insertNode(textNode);
			range.setStartAfter(textNode);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
		hasContent = (editorEl?.textContent?.trim().length ?? 0) > 0;
	}

	function insertMention(c: CustomerOption) {
		if (!mentionRange) return;
		mentionRange.deleteContents();
		const span = document.createElement('span');
		span.className = 'inline-mention';
		span.contentEditable = 'false';
		span.dataset.mentionId = c.id;
		span.dataset.mentionName = c.company;
		span.textContent = `@${c.company}`;
		mentionRange.insertNode(span);
		span.after(' ');
		const spaceNode = span.nextSibling as Node;
		const newRange = document.createRange();
		newRange.setStart(spaceNode, 1);
		newRange.collapse(true);
		window.getSelection()?.removeAllRanges();
		window.getSelection()?.addRange(newRange);
		showDropdown = false;
		mentionQuery = '';
		mentionRange = null;
		hasContent = true;
	}

	function handleEditorBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 150);
	}

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return;
		uploading = true;
		try {
			for (const raw of files) {
				const file = await compressImage(raw);
				const fd = new FormData();
				fd.append('file', file);
				const res = await fetch('/api/upload', { method: 'POST', body: fd });
				if (!res.ok) continue;
				const { key, name: savedName } = (await res.json()) as { key: string; name: string };
				attachments = [
					...attachments,
					{ key, url: `/api/files/${key}`, name: savedName ?? file.name, mimeType: file.type }
				];
			}
		} finally {
			uploading = false;
		}
	}

	function removeAttachment(key: string) {
		attachments = attachments.filter((a) => a.key !== key);
	}

	async function post(e: SubmitEvent) {
		e.preventDefault();
		const bodyText = getBodyText().trim();
		if (!bodyText) return;
		postError = '';
		posting = true;
		try {
			const res = await fetch('/api/activities', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					body: bodyText,
					isPrivate,
					attachments: attachments.map((a) => ({ key: a.key, name: a.name }))
				})
			});
			const result = (await res.json()) as { error?: string };
			if (!res.ok) {
				postError = result.error ?? 'エラーが発生しました';
				return;
			}
			if (editorEl) editorEl.innerHTML = '';
			hasContent = false;
			isPrivate = false;
			attachments = [];
		} finally {
			posting = false;
		}
	}

	return {
		get posting() {
			return posting;
		},
		get postError() {
			return postError;
		},
		get hasContent() {
			return hasContent;
		},
		get isPrivate() {
			return isPrivate;
		},
		set isPrivate(v: boolean) {
			isPrivate = v;
		},
		get attachments() {
			return attachments;
		},
		get uploading() {
			return uploading;
		},
		get editorEl() {
			return editorEl;
		},
		set editorEl(v: HTMLDivElement | undefined) {
			editorEl = v;
		},
		get showDropdown() {
			return showDropdown;
		},
		get filteredCustomers() {
			return filteredCustomers;
		},
		handleEditorInput,
		handleCompositionStart,
		handleCompositionEnd,
		handleKeydown,
		handlePaste,
		insertMention,
		handleEditorBlur,
		handleFiles,
		removeAttachment,
		post
	};
}
