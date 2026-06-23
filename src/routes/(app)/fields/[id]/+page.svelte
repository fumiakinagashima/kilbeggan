<script lang="ts">
	import { bodyToEditorHtml } from '$lib/body';
	import { Lock, Globe } from '@lucide/svelte';

	let { data, form } = $props();

	let isPrivate = $state(data.activity.isPrivate);
	let hasContent = $state(true);
	let editorEl: HTMLDivElement | undefined = $state();
	let isComposing = $state(false);
	let mentionQuery = $state('');
	let mentionRange: Range | null = null;
	let showDropdown = $state(false);
	let submitting = $state(false);

	type CustomerOption = { id: string; company: string };

	let filteredCustomers: CustomerOption[] = $derived(
		showDropdown
			? data.customers
					.filter(
						(c: CustomerOption) =>
							!mentionQuery || c.company.toLowerCase().includes(mentionQuery.toLowerCase())
					)
					.slice(0, 6)
			: []
	);

	const initialEditorHtml = bodyToEditorHtml(data.activity.body);

	function extractText(node: Node, isRoot: boolean): string {
		let result = '';
		for (const child of node.childNodes) {
			if (child.nodeType === Node.TEXT_NODE) {
				result += child.textContent ?? '';
			} else if (child instanceof HTMLElement) {
				if (child.dataset.mentionId) {
					result += `@[${child.dataset.mentionName}](${child.dataset.mentionId})`;
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
		if (!sel || !sel.rangeCount) { showDropdown = false; return; }
		const range = sel.getRangeAt(0);
		const node = range.startContainer;
		if (node.nodeType !== Node.TEXT_NODE) { showDropdown = false; return; }
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
		const space = document.createTextNode(' ');
		(span as any).after(space);
		const newRange = document.createRange();
		newRange.setStart(space, 1);
		newRange.collapse(true);
		window.getSelection()?.removeAllRanges();
		window.getSelection()?.addRange(newRange);
		showDropdown = false;
		mentionQuery = '';
		mentionRange = null;
		hasContent = true;
	}

	function handleSubmit(e: SubmitEvent) {
		const formEl = e.target as HTMLFormElement;
		const bodyInput = formEl.querySelector('input[name="body"]') as HTMLInputElement;
		bodyInput.value = getBodyText();
		submitting = true;
	}
</script>

<div class="page">
	<header class="page-header">
		<a href="/fields" class="back">← 活動一覧</a>
		<h1>活動を編集</h1>
	</header>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<form method="POST" onsubmit={handleSubmit}>
		<input type="hidden" name="body" value="" />
		<input type="hidden" name="isPrivate" value={isPrivate} />

		<div class="editor-wrap">
			<div
				class="editor"
				contenteditable={submitting ? 'false' : 'true'}
				role="textbox"
				aria-multiline="true"
				bind:this={editorEl}
				oninput={handleEditorInput}
				onkeydown={handleKeydown}
				oncompositionstart={() => (isComposing = true)}
				oncompositionend={() => { isComposing = false; checkMention(); }}
				onpaste={handlePaste}
				onblur={() => setTimeout(() => { showDropdown = false; }, 150)}
				tabindex="0"
			>{@html initialEditorHtml}</div>
			{#if showDropdown && filteredCustomers.length > 0}
				<ul class="mention-dropdown">
					{#each filteredCustomers as c (c.id)}
						<li>
							<button type="button" onmousedown={() => insertMention(c)}>
								{c.company}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="compose-footer">
			<button
				type="button"
				class="privacy-toggle"
				class:private={isPrivate}
				onclick={() => (isPrivate = !isPrivate)}
			>
				{#if isPrivate}
					<Lock size={13} />
					非公開
				{:else}
					<Globe size={13} />
					全体公開
				{/if}
			</button>
			<div class="actions">
				<a href="/fields" class="btn-cancel">キャンセル</a>
				<button type="submit" class="btn-save" disabled={submitting || !hasContent}>
					{submitting ? '保存中...' : '保存'}
				</button>
			</div>
		</div>
	</form>
</div>

<style lang="scss">
	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: 0 1rem 2rem;

		@media (min-width: 768px) {
			padding: 0 2rem 2rem;
		}
	}

	.page-header {
		padding: 1.25rem 0 1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1rem;

		.back {
			display: block;
			font-size: 0.875rem;
			color: var(--color-primary);
			text-decoration: none;
			margin-bottom: 0.5rem;
		}

		h1 {
			font-size: 1.125rem;
			font-weight: 700;
		}
	}

	.error {
		font-size: 0.875rem;
		color: var(--color-error);
		background: var(--color-error-bg);
		padding: 0.625rem 0.875rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.editor-wrap {
		position: relative;
		margin-bottom: 0.75rem;
	}

	.editor {
		border: 1px solid var(--color-border);
		min-height: 10rem;
		padding: 0.75rem;
		font-size: 1rem;
		font-family: inherit;
		line-height: 1.47;
		outline: none;
		background: var(--color-surface);
		color: var(--color-text);
		cursor: text;
		white-space: pre-wrap;
		word-break: break-word;
		text-align: left;
		border-radius: 8px;

		&[contenteditable='false'] {
			opacity: 0.6;
		}
	}

	:global(.inline-mention) {
		color: var(--color-primary);
		font-weight: 500;
		user-select: all;
	}

	.mention-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		list-style: none;
		overflow: hidden;
		z-index: 10;

		li button {
			display: block;
			width: 100%;
			text-align: left;
			padding: 0.625rem 1rem;
			font-size: 0.9375rem;
			background: none;
			border: none;
			cursor: pointer;
			color: var(--color-text);

			&:hover {
				background: var(--color-background);
			}
		}
	}

	.compose-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.privacy-toggle {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.375rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		background: var(--color-surface);
		color: var(--color-text-muted);
		font-size: 0.8125rem;
		cursor: pointer;
		transition: color 0.15s, border-color 0.15s, background 0.15s;

		&.private {
			color: var(--color-primary);
			border-color: var(--color-primary);
			background: color-mix(in srgb, var(--color-primary) 8%, transparent);
		}
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-cancel {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		font-size: 0.875rem;
		color: var(--color-text-muted);
		text-decoration: none;
		background: var(--color-surface);

		&:hover {
			background: var(--color-background);
		}
	}

	.btn-save {
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
</style>
