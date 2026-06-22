<script lang="ts">
	import { timeAgo } from '$lib/datetime';
	import { parseBody } from '$lib/body';
	import { Lock, Globe } from '@lucide/svelte';

	let { data } = $props();

	type CustomerOption = { id: string; company: string };
	type ActivityItem = {
		id: string;
		body: string;
		isPrivate: boolean;
		createdAt: Date | string;
		userId: string | null;
		userName: string | null;
		mentions: { customerId: string; company: string }[];
	};

	// compose state
	let posting = $state(false);
	let postError = $state('');
	let hasContent = $state(false);
	let isPrivate = $state(false);

	// feed state
	let newActivities: ActivityItem[] = $state([]);
	let privacyMap = $state<Record<string, boolean>>({});
	let allActivities = $derived(
		[...newActivities, ...data.activities].map((a) => ({
			...a,
			isPrivate: a.id in privacyMap ? privacyMap[a.id] : a.isPrivate
		}))
	);

	// contenteditable editor
	let editorEl: HTMLDivElement | undefined = $state();
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

	function getBodyText(): string {
		if (!editorEl) return '';
		let result = '';
		for (const node of editorEl.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				result += node.textContent ?? '';
			} else if (node instanceof HTMLElement) {
				if (node.dataset.mentionId) {
					result += `@[${node.dataset.mentionName}](${node.dataset.mentionId})`;
				} else if (node.tagName === 'BR') {
					result += '\n';
				} else {
					result += node.textContent ?? '';
				}
			}
		}
		return result;
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

		const space = document.createTextNode(' ');
		span.after(space);
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

	function handleEditorBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 150);
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
				body: JSON.stringify({ body: bodyText, isPrivate })
			});
			const result = (await res.json()) as ActivityItem & { error?: string };
			if (!res.ok) {
				postError = result.error ?? 'エラーが発生しました';
				return;
			}
			newActivities = [{ ...result, userName: data.user?.name ?? null }, ...newActivities];
			if (editorEl) editorEl.innerHTML = '';
			hasContent = false;
			isPrivate = false;
		} finally {
			posting = false;
		}
	}

	async function togglePrivacy(activityId: string, current: boolean) {
		const next = !current;
		privacyMap = { ...privacyMap, [activityId]: next };
		const res = await fetch(`/api/activities/${activityId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isPrivate: next })
		});
		if (!res.ok) {
			const copy = { ...privacyMap };
			delete copy[activityId];
			privacyMap = copy;
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
					data-placeholder="活動を記録..."
					bind:this={editorEl}
					oninput={handleEditorInput}
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
				<button type="submit" class="btn-post" disabled={posting || !hasContent}>
					{posting ? '送信中...' : '投稿'}
				</button>
			</div>
		</form>
	</section>

	{#if allActivities.length === 0}
		<p class="empty">まだ活動記録がありません</p>
	{:else}
		<ul class="feed">
			{#each allActivities as activity (activity.id)}
				<li class="card" class:private-card={activity.isPrivate}>
					<p class="body">
						{#each parseBody(activity.body) as seg, i (i)}
							{#if seg.type === 'text'}
								{seg.text}
							{:else}
								<span class="mention">@{seg.name}</span>
							{/if}
						{/each}
					</p>
					<div class="meta">
						<span>{activity.userName ?? ''}</span>
						<div class="meta-right">
							{#if activity.isPrivate}
								<span class="private-badge"><Lock size={11} />非公開</span>
							{/if}
							{#if data.user?.userId === activity.userId}
								<button
									class="visibility-btn"
									onclick={() => togglePrivacy(activity.id, activity.isPrivate)}
								>
									{activity.isPrivate ? '公開する' : '非公開にする'}
								</button>
							{/if}
							<span>{timeAgo(new Date(activity.createdAt))}</span>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
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
		border-bottom: 1px solid var(--color-border);
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
		min-height: 5rem;
		padding: 0.75rem 0;
		font-size: 1rem;
		font-family: inherit;
		line-height: 1.6;
		outline: none;
		background: transparent;
		color: var(--color-text);
		cursor: text;
		white-space: pre-wrap;
		word-break: break-word;
		text-align: left;

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
				background: var(--color-bg);
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

	.error {
		font-size: 0.875rem;
		color: var(--color-error);
		background: var(--color-error-bg);
		padding: 0.625rem 0.875rem;
		border-radius: 8px;
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

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: 3rem 0;
		font-size: 0.9375rem;
	}

	.feed {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;

		&.private-card {
			background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
			border-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
		}
	}

	.body {
		font-size: 0.9375rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
		margin-bottom: 0.5rem;
	}

	.mention {
		color: var(--color-primary);
		font-weight: 500;
	}

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		gap: 0.5rem;
	}

	.meta-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.private-badge {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		color: var(--color-primary);
		font-size: 0.75rem;
	}

	.visibility-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;

		&:hover {
			color: var(--color-text);
		}
	}
</style>
