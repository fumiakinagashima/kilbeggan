<script lang="ts">
	import { bodyToEditorHtml } from '$lib/body';
	import { Lock, Globe } from '@lucide/svelte';
	import { createActivityEditState } from './index.svelte.ts';
	import AttachmentArea from '$lib/components/AttachmentArea.svelte';

	let { data, form } = $props();
	const edit = createActivityEditState(() => data);

	const initialEditorHtml = bodyToEditorHtml(data.activity.body);
</script>

<div class="page">
	<header class="page-header">
		<a href="/fields" class="back">← 活動一覧</a>
		<h1>活動を編集</h1>
	</header>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<form id="delete-form" method="POST" action="?/delete" style="display:none"></form>

	<form method="POST" onsubmit={(e) => edit.handleSubmit(e)}>
		<input type="hidden" name="body" value="" />
		<input type="hidden" name="isPrivate" value={edit.isPrivate} />
		<input type="hidden" name="attachments" value="" />

		<div class="editor-wrap">
			<div
				class="editor"
				class:empty={!edit.hasContent}
				contenteditable={edit.submitting ? 'false' : 'true'}
				role="textbox"
				aria-multiline="true"
				data-placeholder="活動内容を入力してください"
				bind:this={edit.editorEl}
				oninput={() => edit.handleEditorInput()}
				onkeydown={(e) => edit.handleKeydown(e)}
				oncompositionstart={() => edit.handleCompositionStart()}
				oncompositionend={() => edit.handleCompositionEnd()}
				onpaste={(e) => edit.handlePaste(e)}
				onblur={() => edit.handleEditorBlur()}
				tabindex="0"
			>{@html initialEditorHtml}</div>
			{#if edit.showDropdown && edit.filteredCustomers.length > 0}
				<ul class="mention-dropdown">
					{#each edit.filteredCustomers as c (c.id)}
						<li>
							<button type="button" onmousedown={() => edit.insertMention(c)}>
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
				class:private={edit.isPrivate}
				onclick={() => (edit.isPrivate = !edit.isPrivate)}
			>
				{#if edit.isPrivate}
					<Lock size={13} />
					非公開
				{:else}
					<Globe size={13} />
					全体公開
				{/if}
			</button>
			<div class="actions">
				<button
					type="button"
					class="btn-delete"
					onclick={() => edit.handleDelete()}
					disabled={edit.deleting || edit.submitting}
				>
					{edit.deleting ? '削除中...' : '削除'}
				</button>
				<a href="/fields" class="btn-cancel">キャンセル</a>
				<button type="submit" class="btn-save" disabled={edit.submitting || !edit.hasContent || edit.uploading}>
					{edit.submitting ? '保存中...' : '保存'}
				</button>
			</div>
		</div>

		<AttachmentArea
			attachments={edit.attachments}
			uploading={edit.uploading}
			onFiles={(files) => edit.handleFiles(files)}
			onRemove={(key) => edit.removeAttachment(key)}
		/>
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
		padding: 0.8rem;
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

		&.empty:not(:focus)::before {
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

	.compose-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.privacy-toggle {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.575rem 0.75rem;
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

	.btn-delete {
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-error);
		border-radius: 20px;
		font-size: 0.875rem;
		color: var(--color-error);
		background: transparent;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;

		&:hover {
			background: var(--color-error);
			color: #fff;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
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
