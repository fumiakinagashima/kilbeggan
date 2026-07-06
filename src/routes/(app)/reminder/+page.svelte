<script lang="ts">
	import { Play } from '@lucide/svelte';
	import { formatJstDateTime } from '$lib/datetime';
	import { createReminderPageState } from './index.svelte.ts';

	let { data } = $props();
	const state = createReminderPageState(() => data);

	const STATUS_LABELS: Record<string, string> = {
		pending: '未送信',
		sent: '送信済み',
		failed: '送信失敗'
	};
</script>

<div class="page">
	<header class="page-header">
		<h1>リマインダー</h1>
		<button class="btn-secondary" onclick={state.runDelivery} disabled={state.running}>
			<Play size={16} />
			{state.running ? '実行中...' : '今すぐ配信'}
		</button>
	</header>

	{#if state.runMessage}
		<p class="run-message">{state.runMessage}</p>
	{/if}

	<section class="card">
		<h2>{state.editingId ? 'リマインダーを編集' : 'リマインダーを登録'}</h2>

		<form onsubmit={(e) => state.submit(e)}>
			{#if state.error}
				<p class="error">{state.error}</p>
			{/if}

			<div class="field">
				<label for="remind-at">日時</label>
				<input
					id="remind-at"
					type="datetime-local"
					bind:value={state.remindAt}
					required
					disabled={state.submitting}
				/>
			</div>

			<div class="field">
				<label for="content">内容</label>
				<textarea
					id="content"
					rows="3"
					bind:value={state.content}
					required
					disabled={state.submitting}></textarea>
			</div>

			<div class="field">
				<span class="field-label">通知先</span>
				<div class="channel-options">
					{#each state.channelOptions as option (option.value)}
						<label class="channel-option">
							<input
								type="checkbox"
								checked={state.selectedChannels.includes(option.value)}
								onchange={() => state.toggleChannel(option.value)}
								disabled={state.submitting}
							/>
							{option.label}
						</label>
					{/each}
				</div>
			</div>

			<div class="footer">
				{#if state.editingId}
					<button type="button" class="btn-text" onclick={state.cancelEdit}>キャンセル</button>
				{/if}
				<button
					type="submit"
					class="btn-primary"
					disabled={state.submitting || !state.content.trim()}
				>
					{state.submitting ? '保存中...' : state.editingId ? '更新' : '登録'}
				</button>
			</div>
		</form>
	</section>

	{#if state.rows.length === 0}
		<p class="empty">リマインダーが登録されていません</p>
	{:else}
		<ul class="list">
			{#each state.rows as row (row.id)}
				<li class="item">
					<div class="item-info">
						<div class="item-top-row">
							<span class="datetime">{formatJstDateTime(row.remindAt)}</span>
							<span class="status-badge status-{row.status}">{STATUS_LABELS[row.status]}</span>
						</div>
						<p class="content">{row.content}</p>
						<span class="channels">{row.channelLabels.join(' / ')}</span>
					</div>
					<div class="actions">
						{#if row.status === 'pending'}
							<button class="btn-text" onclick={() => state.startEdit(row)}>編集</button>
						{/if}
						<button class="btn-text danger" onclick={() => state.deleteRow(row.id)}>削除</button>
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

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.25rem 0 1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1rem;

		h1 {
			font-size: 1.125rem;
			font-weight: 700;
		}
	}

	.btn-secondary {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text);
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.run-message {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin-bottom: 1rem;
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 1.5rem;

		h2 {
			font-size: 0.9375rem;
			font-weight: 600;
			margin-bottom: 1rem;
		}
	}

	.error {
		font-size: 0.875rem;
		color: var(--color-danger);
		background: var(--color-error-bg);
		padding: 0.625rem 0.875rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 1rem;

		label,
		.field-label {
			font-size: 0.875rem;
			font-weight: 500;
		}

		input,
		textarea {
			padding: 0.75rem 1rem;
			border: 1px solid var(--color-border);
			border-radius: 8px;
			font-size: 1rem;
			background: var(--color-background);
			color: var(--color-text);
			outline: none;
			width: 100%;
			font-family: inherit;
			resize: vertical;
			transition: border-color 0.15s;

			&:focus {
				border-color: var(--color-primary);
			}

			&:disabled {
				opacity: 0.6;
			}
		}
	}

	.channel-options {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.channel-option {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.9375rem;
		font-weight: 400;
		cursor: pointer;

		input {
			width: auto;
		}
	}

	.footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.btn-text {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0.5rem 0;

		&.danger {
			color: var(--color-danger);
		}

		&:hover {
			text-decoration: underline;
		}
	}

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: 3rem 0;
		font-size: 0.9375rem;
	}

	.list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
	}

	.item-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-top-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.datetime {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.status-badge {
		display: inline-block;
		padding: 0.1rem 0.45rem;
		border-radius: 20px;
		font-size: 0.7rem;
		font-weight: 600;
		border: 1px solid;

		&.status-pending {
			color: #b45309;
			border-color: color-mix(in srgb, #f59e0b 40%, transparent);
			background: color-mix(in srgb, #f59e0b 15%, transparent);
			:global([data-theme='dark']) & {
				color: #fbbf24;
			}
		}
		&.status-sent {
			color: #15803d;
			border-color: color-mix(in srgb, #22c55e 35%, transparent);
			background: color-mix(in srgb, #22c55e 12%, transparent);
			:global([data-theme='dark']) & {
				color: #4ade80;
			}
		}
		&.status-failed {
			color: var(--color-danger);
			border-color: color-mix(in srgb, var(--color-danger) 40%, transparent);
			background: var(--color-error-bg);
		}
	}

	.content {
		font-size: 0.875rem;
		overflow-wrap: anywhere;
	}

	.channels {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.125rem;
		flex-shrink: 0;
	}
</style>
