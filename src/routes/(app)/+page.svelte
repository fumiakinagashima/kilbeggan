<script lang="ts">
	import { Lock, Globe, Paperclip, Camera } from '@lucide/svelte';
	import { createComposeState } from './index.svelte.ts';

	let { data } = $props();
	const state = createComposeState(() => data);
</script>

<div class="page">
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

			{#if state.attachments.length > 0}
				<div class="attachments-preview">
					{#each state.attachments as item (item.key)}
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
								onclick={() => state.removeAttachment(item.key)}
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
						class:private={state.isPrivate}
						onclick={() => (state.isPrivate = !state.isPrivate)}
					>
						{#if state.isPrivate}
							<Lock size={13} />
							非公開
						{:else}
							<Globe size={13} />
							全体公開
						{/if}
					</button>
					<input
						bind:this={state.fileInputEl}
						type="file"
						multiple
						style="display:none"
						onchange={(e) => state.handleFiles((e.target as HTMLInputElement).files)}
					/>
					<input
						bind:this={state.cameraInputEl}
						type="file"
						accept="image/*"
						capture="environment"
						style="display:none"
						onchange={(e) => state.handleFiles((e.target as HTMLInputElement).files)}
					/>
					<button
						type="button"
						class="attach-btn"
						onclick={() => state.fileInputEl?.click()}
						disabled={state.uploading}
						title="ファイルを添付"
					>
						<Paperclip size={16} />
					</button>
					<button
						type="button"
						class="attach-btn"
						onclick={() => state.cameraInputEl?.click()}
						disabled={state.uploading}
						title="写真を撮影"
					>
						<Camera size={16} />
					</button>
				</div>
				<button type="submit" class="btn-post" disabled={state.posting || !state.hasContent || state.uploading}>
					{state.posting ? '送信中...' : '投稿'}
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
