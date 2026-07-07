<script lang="ts">
	import { formatDate } from '$lib/datetime';
	import { createCustomerDetailState } from './index.svelte.ts';

	let { data } = $props();
	const state = createCustomerDetailState(() => data);
</script>

<div class="page">
	<header class="page-header">
		<a href="/customers" class="back">← 顧客一覧</a>
		<div class="page-title">
			<h1>{data.customer.company}</h1>
			<a href="/customers/{data.customer.id}/edit" class="edit-link">編集</a>
		</div>
	</header>

	<div class="score-section">
		<div class="score-display" class:has-score={state.score !== null}>
			{#if state.score !== null}
				<div class="score-value {state.scoreLabel(state.score)}">
					<span class="score-number">{state.score}</span>
					<span class="score-max">/100</span>
				</div>
				<div class="score-meta">
					<span class="score-level {state.scoreLabel(state.score)}">{state.scoreLevelText(state.score)}</span>
					{#if state.scoreReason}
						<span class="score-reason">{state.scoreReason}</span>
					{/if}
				</div>
			{:else if state.scoreError}
				<span class="score-empty score-error">{state.scoreError}</span>
			{:else}
				<span class="score-empty">スコア未算出</span>
			{/if}
		</div>
		<button class="btn-action" onclick={state.recalcScore} disabled={state.scoring}>
			{state.scoring ? '計算中...' : state.score !== null ? '再計算' : 'スコアを計算'}
		</button>
	</div>

	{#if data.customer.phone || data.customer.email}
		<section class="contact-info">
			{#if data.customer.phone}
				<a href="tel:{data.customer.phone}" class="contact-item">
					<span class="contact-label">電話</span>
					<span>{data.customer.phone}</span>
				</a>
			{/if}
			{#if data.customer.email}
				<a href="mailto:{data.customer.email}" class="contact-item">
					<span class="contact-label">メール</span>
					<span>{data.customer.email}</span>
				</a>
			{/if}
		</section>
	{/if}

	{#if data.customer.notes}
	<section class="contact-info">
		<p class="contact-label">備考</p>
		<p class="notes">{data.customer.notes}</p>
	</section>
	{/if}

	<section class="ai-summary" class:generating={state.generating}>
		<div class="section-header">
			<div class="section-title-row">
				<h2>AI要約</h2>
				{#if state.summaryEditedBy}
					<span class="edit-badge">手動編集: {state.summaryEditedBy} · {state.summaryEditedAt ? formatDate(state.summaryEditedAt) : ''}</span>
				{/if}
			</div>
			<div class="section-actions">
				{#if !state.editingSummary}
					{#if state.summary}
						<button class="btn-text" onclick={state.startEditSummary}>編集</button>
					{/if}
					<button class="btn-action" onclick={state.generateSummary} disabled={state.generating}>
						{state.generating ? '生成中...' : state.summary ? '再生成' : '要約を生成'}
					</button>
				{/if}
			</div>
		</div>

		{#if state.editingSummary}
			<textarea
				class="edit-textarea"
				bind:value={state.editSummaryText}
				rows="5"
				placeholder="要約を入力..."
			></textarea>
			<div class="edit-actions">
				<button class="btn-action" onclick={state.saveSummary} disabled={state.savingSummary}>
					{state.savingSummary ? '保存中...' : '保存'}
				</button>
				<button class="btn-cancel" onclick={state.cancelEditSummary} disabled={state.savingSummary}>
					キャンセル
				</button>
			</div>
		{:else if state.summary}
			<p class="summary-text">{state.summary}</p>
		{:else}
			<p class="summary-empty">「要約を生成」ボタンを押すと、活動履歴からAIが分析を作成します。</p>
		{/if}
	</section>

	<section class="manager-comment">
		<div class="section-header">
			<div class="section-title-row">
				<h2>マネージャーコメント</h2>
				{#if state.managerCommentEditedBy}
					<span class="edit-badge">{state.managerCommentEditedBy} · {state.managerCommentEditedAt ? formatDate(state.managerCommentEditedAt) : ''}</span>
				{/if}
			</div>
			{#if !state.editingComment}
				<button class="btn-text" onclick={state.startEditComment}>
					{state.managerComment ? '編集' : '追加'}
				</button>
			{/if}
		</div>

		{#if state.editingComment}
			<textarea
				class="edit-textarea"
				bind:value={state.editCommentText}
				rows="4"
				placeholder="短期目標や担当へのアドバイスを入力..."
			></textarea>
			<div class="edit-actions">
				<button class="btn-action" onclick={state.saveComment} disabled={state.savingComment}>
					{state.savingComment ? '保存中...' : '保存'}
				</button>
				<button class="btn-cancel" onclick={state.cancelEditComment} disabled={state.savingComment}>
					キャンセル
				</button>
			</div>
		{:else if state.managerComment}
			<p class="comment-text">{state.managerComment}</p>
		{:else}
			<p class="summary-empty">短期目標や担当営業へのアドバイスを記録できます。</p>
		{/if}
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
	}

	.page-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;

		h1 {
			font-size: 1.25rem;
			font-weight: 700;
		}

		.edit-link {
			font-size: 0.875rem;
			color: var(--color-primary);
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}
		}
	}

	.score-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.score-display {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.score-value {
		display: flex;
		align-items: baseline;
		gap: 0.125rem;
		flex-shrink: 0;

		.score-number {
			font-size: 2rem;
			font-weight: 800;
			line-height: 1;
		}
		.score-max {
			font-size: 0.8125rem;
			color: var(--color-text-muted);
		}

		&.hot .score-number { color: #16a34a; }
		&.warm .score-number { color: #2563eb; }
		&.neutral .score-number { color: #d97706; }
		&.cold .score-number { color: #6b7280; }

		:global([data-theme='dark']) {
			&.hot .score-number { color: #4ade80; }
			&.warm .score-number { color: #60a5fa; }
			&.neutral .score-number { color: #fbbf24; }
			&.cold .score-number { color: #9ca3af; }
		}
	}

	.score-meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.score-level {
		font-size: 0.8125rem;
		font-weight: 600;

		&.hot { color: #16a34a; }
		&.warm { color: #2563eb; }
		&.neutral { color: #d97706; }
		&.cold { color: #6b7280; }
	}

	.score-reason {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.score-empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);

		&.score-error {
			font-size: 0.8125rem;
			line-height: 1.5;
			white-space: normal;
		}
	}

	.contact-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.875rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		margin-bottom: 1rem;
	}

	.contact-item {
		display: flex;
		gap: 0.75rem;
		font-size: 0.9375rem;
		color: inherit;
		text-decoration: none;
	}

	.contact-label {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		width: 3rem;
		flex-shrink: 0;
	}

	.notes {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.ai-summary,
	.manager-comment {
		padding: 0.875rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		margin-bottom: 1rem;
		transition: opacity 0.2s;

		&.generating {
			opacity: 0.7;
		}
	}

	.section-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 0.625rem;
		gap: 0.5rem;
	}

	.section-title-row {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;

		h2 {
			font-size: 0.8125rem;
			font-weight: 600;
			color: var(--color-text-muted);
			text-transform: uppercase;
			letter-spacing: 0.03em;
		}
	}

	.edit-badge {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.section-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.btn-action {
		padding: 0.3rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
		color: var(--color-primary);
		border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
		border-radius: 20px;
		cursor: pointer;
		transition: background 0.15s;
		flex-shrink: 0;

		&:hover:not(:disabled) {
			background: color-mix(in srgb, var(--color-primary) 18%, transparent);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.btn-text {
		padding: 0.3rem 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-primary);
		background: none;
		border: none;
		cursor: pointer;
		flex-shrink: 0;

		&:hover {
			text-decoration: underline;
		}
	}

	.btn-cancel {
		padding: 0.3rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--color-text-muted);
		background: none;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		cursor: pointer;

		&:hover:not(:disabled) {
			background: var(--color-border);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.edit-textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		font-size: 0.9375rem;
		font-family: inherit;
		line-height: 1.6;
		color: var(--color-text);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		resize: vertical;
		box-sizing: border-box;

		&:focus {
			outline: none;
			border-color: var(--color-primary);
		}
	}

	.edit-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.summary-text,
	.comment-text {
		font-size: 0.9375rem;
		line-height: 1.65;
		color: var(--color-text);
		white-space: pre-wrap;
	}

	.summary-empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}


</style>
