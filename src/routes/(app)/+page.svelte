<script lang="ts">
	import { Lock, Globe } from '@lucide/svelte';
	import { createComposeState } from './index.svelte.ts';
	import AttachmentArea from '$lib/components/AttachmentArea.svelte';

	let { data } = $props();
	const state = createComposeState(() => data);
</script>

<div class="page">
	<h1 class="app-title">KILBEGGAN</h1>
	<section class="compose">
		<form onsubmit={(e) => state.post(e)}>
			{#if state.postError}
				<p class="error">{state.postError}</p>
			{/if}
			<div class="editor-wrap">
				<div
					class="editor"
					class:empty={!state.hasContent}
					contenteditable={state.posting ? 'false' : 'true'}
					role="textbox"
					aria-multiline="true"
					tabindex="0"
					data-placeholder="活動内容を入力してください"
					bind:this={state.editorEl}
					oninput={() => state.handleEditorInput()}
					onkeydown={(e) => state.handleKeydown(e)}
					oncompositionstart={() => state.handleCompositionStart()}
					oncompositionend={() => state.handleCompositionEnd()}
					onpaste={(e) => state.handlePaste(e)}
					onblur={() => state.handleEditorBlur()}
				></div>
				{#if state.showDropdown && state.filteredCustomers.length > 0}
					<ul class="mention-dropdown">
						{#each state.filteredCustomers as c (c.id)}
							<li>
								<button type="button" onmousedown={() => state.insertMention(c)}>
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
					class:private={state.isPrivate}
					onclick={() => (state.isPrivate = !state.isPrivate)}
				>
					{#if state.isPrivate}
						<Lock size={13} />
						非対象
					{:else}
						<Globe size={13} />
						要約対象
					{/if}
				</button>
				<button type="submit" class="btn-post" disabled={state.posting || !state.hasContent || state.uploading}>
					{state.posting ? '送信中...' : '投稿'}
				</button>
			</div>

			<AttachmentArea
				attachments={state.attachments}
				uploading={state.uploading}
				onFiles={(files) => state.handleFiles(files)}
				onRemove={(key) => state.removeAttachment(key)}
			/>
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

	.app-title {
		text-align: center;
		padding: 1.2rem 0 0.3rem;
		color: var(--color-primary);
		font-family: Georgia, 'Times New Roman', Times, serif;
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
		padding: 0.35rem 0.7rem;
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
