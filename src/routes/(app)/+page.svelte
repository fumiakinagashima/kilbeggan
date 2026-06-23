<script lang="ts">
	import { Lock, Globe, Paperclip, Camera } from '@lucide/svelte';

	let { data } = $props();

	type CustomerOption = { id: string; company: string };
	type AttachmentItem = { key: string; url: string; name: string; mimeType: string };

	// compose state
	let posting = $state(false);
	let postError = $state('');
	let hasContent = $state(false);
	let isPrivate = $state(false);
	let attachments = $state<AttachmentItem[]>([]);
	let uploading = $state(false);

	// contenteditable editor
	let editorEl: HTMLDivElement | undefined = $state();
	let fileInputEl: HTMLInputElement | undefined = $state();
	let cameraInputEl: HTMLInputElement | undefined = $state();
	let isComposing = $state(false);
	let mentionQuery = $state('');
	let mentionRange: Range | null = null;
	let showDropdown = $state(false);

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
			for (const file of files) {
				const fd = new FormData();
				fd.append('file', file);
				const res = await fetch('/api/upload', { method: 'POST', body: fd });
				if (!res.ok) continue;
				const { key } = (await res.json()) as { key: string };
				attachments = [
					...attachments,
					{ key, url: `/api/files/${key}`, name: file.name, mimeType: file.type }
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
					attachments: attachments.map((a) => a.key)
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
</script>

<div class="page">
	<section class="compose">
		<form onsubmit={post}>
			{#if postError}
				<p class="error">{postError}</p>
			{/if}
			<div class="editor-wrap">
				<div
					class="editor"
					class:empty={!hasContent}
					contenteditable={posting ? 'false' : 'true'}
					role="textbox"
					aria-multiline="true"
					tabindex="0"
					bind:this={editorEl}
					oninput={handleEditorInput}
					onkeydown={handleKeydown}
					oncompositionstart={() => (isComposing = true)}
					oncompositionend={handleCompositionEnd}
					onpaste={handlePaste}
					onblur={handleEditorBlur}
				></div>
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

			{#if attachments.length > 0}
				<div class="attachments-preview">
					{#each attachments as item (item.key)}
						<div class="attachment-item">
							{#if item.mimeType.startsWith('image/')}
								<img src={item.url} alt={item.name} />
							{:else}
								<span class="file-icon">📄</span>
								<span class="file-name">{item.name}</span>
							{/if}
							<button
								type="button"
								class="remove-btn"
								onclick={() => removeAttachment(item.key)}
							>×</button>
						</div>
					{/each}
				</div>
			{/if}

			<div class="compose-footer">
				<div class="compose-actions">
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
					<input
						bind:this={fileInputEl}
						type="file"
						multiple
						style="display:none"
						onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
					/>
					<input
						bind:this={cameraInputEl}
						type="file"
						accept="image/*"
						capture="environment"
						style="display:none"
						onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
					/>
					<button
						type="button"
						class="attach-btn"
						onclick={() => fileInputEl?.click()}
						disabled={uploading}
						title="ファイルを添付"
					>
						<Paperclip size={16} />
					</button>
					<button
						type="button"
						class="attach-btn"
						onclick={() => cameraInputEl?.click()}
						disabled={uploading}
						title="写真を撮影"
					>
						<Camera size={16} />
					</button>
				</div>
				<button type="submit" class="btn-post" disabled={posting || !hasContent || uploading}>
					{posting ? '送信中...' : '投稿'}
				</button>
			</div>
		</form>
	</section>
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

	.compose {
		padding: 1rem 0;
		margin-bottom: 1rem;

		form {
			display: flex;
			flex-direction: column;
			gap: 0;
		}
	}

	.editor-wrap {
		position: relative;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 0.625rem;
	}

	.editor {
		border: 1px solid var(--color-border);
		min-height: 12rem;
		padding: 0.55rem;
		font-size: 1rem;
		font-family: inherit;
		line-height: 1.47;
		outline: none;
		background: transparent;
		color: var(--color-text);
		cursor: text;
		white-space: pre-wrap;
		word-break: break-word;
		text-align: left;
		border-radius: 6px;

		&[contenteditable='false'] {
			opacity: 0.6;
		}

		&.empty::before {
			content: attr(data-placeholder);
			color: var(--color-text-muted);
			pointer-events: none;
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

	.attachments-preview {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 0.625rem;
	}

	.attachment-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.25rem;
		max-width: 120px;

		img {
			width: 80px;
			height: 80px;
			object-fit: cover;
			border-radius: 6px;
			display: block;
		}

		.file-icon {
			font-size: 1.5rem;
			padding: 0.25rem;
		}

		.file-name {
			font-size: 0.75rem;
			color: var(--color-text-muted);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 80px;
		}
	}

	.remove-btn {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-text-muted);
		color: var(--color-surface);
		border: none;
		cursor: pointer;
		font-size: 0.75rem;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;

		&:hover {
			background: var(--color-error);
		}
	}

	.compose-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.compose-actions {
		display: flex;
		align-items: center;
		gap: 0.375rem;
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
		transition:
			color 0.15s,
			border-color 0.15s,
			background 0.15s;

		&.private {
			color: var(--color-primary);
			border-color: var(--color-primary);
			background: color-mix(in srgb, var(--color-primary) 8%, transparent);
		}
	}

	.attach-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--color-border);
		border-radius: 50%;
		background: var(--color-surface);
		color: var(--color-text-muted);
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;

		&:hover {
			color: var(--color-text);
			border-color: var(--color-text-muted);
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}

	.error {
		font-size: 0.875rem;
		color: var(--color-error);
		background: var(--color-error-bg);
		padding: 0.625rem 0.875rem;
		border-radius: 8px;
		margin-bottom: 0.5rem;
	}

	.btn-post {
		padding: 0.5rem 1.25rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
		white-space: nowrap;

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
</style>
