<script lang="ts">
	import { timeAgo } from '$lib/datetime';
	import { bodyToHtml } from '$lib/body';

	let { data } = $props();

	let summary = $state(data.customer.aiSummary ?? '');
	let generating = $state(false);

	async function generateSummary() {
		generating = true;
		try {
			const res = await fetch(`/api/customers/${data.customer.id}/summarize`, { method: 'POST' });
			if (res.ok) {
				const result = (await res.json()) as { summary: string };
				summary = result.summary;
			}
		} finally {
			generating = false;
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<a href="/customers" class="back">← 顧客一覧</a>
		<div class="page-title">
			<h1>{data.customer.company}</h1>
			<a href="/customers/{data.customer.id}/edit" class="edit-link">編集</a>
		</div>
	</header>

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
		<p class="notes">{data.customer.notes}</p>
	{/if}

	<section class="ai-summary" class:generating>
		<div class="ai-summary-header">
			<h2>AI要約</h2>
			<button onclick={generateSummary} disabled={generating} class="btn-generate">
				{generating ? '生成中...' : summary ? '再生成' : '要約を生成'}
			</button>
		</div>
		{#if summary}
			<p class="summary-text">{summary}</p>
		{:else}
			<p class="summary-empty">「要約を生成」ボタンを押すと、活動履歴からAIが要約を作成します。</p>
		{/if}
	</section>

	<section class="history">
		<h2>活動履歴</h2>
		{#if data.activities.length === 0}
			<p class="empty">まだ活動記録がありません</p>
		{:else}
			<ul class="activity-list">
				{#each data.activities as activity (activity.id)}
					<li class="activity-item">
						<p class="activity-body">{@html bodyToHtml(activity.body)}</p>
						{#if activity.tags && activity.tags.length > 0}
							<div class="activity-tags">
								{#each activity.tags as tag}
									<span class="tag">{tag}</span>
								{/each}
							</div>
						{/if}
						<div class="activity-meta">
							<span>{activity.userName ?? ''}</span>
							<span>{timeAgo(new Date(activity.createdAt))}</span>
						</div>
					</li>
				{/each}
			</ul>
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
		padding: 0 0 1rem;
		white-space: pre-wrap;
	}

	.ai-summary {
		padding: 0.875rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		margin-bottom: 1.5rem;
		transition: opacity 0.2s;

		&.generating {
			opacity: 0.7;
		}
	}

	.ai-summary-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.625rem;

		h2 {
			font-size: 0.8125rem;
			font-weight: 600;
			color: var(--color-text-muted);
			text-transform: uppercase;
			letter-spacing: 0.03em;
		}
	}

	.btn-generate {
		padding: 0.3rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
		color: var(--color-primary);
		border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
		border-radius: 20px;
		cursor: pointer;
		transition: background 0.15s;

		&:hover:not(:disabled) {
			background: color-mix(in srgb, var(--color-primary) 18%, transparent);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.summary-text {
		font-size: 0.9375rem;
		line-height: 1.65;
		color: var(--color-text);
	}

	.summary-empty {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.history h2 {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
	}

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: 2rem 0;
		font-size: 0.875rem;
	}

	.activity-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.activity-item {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 0.875rem 1rem;
	}

	.activity-body {
		font-size: 0.9375rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
		margin-bottom: 0.5rem;
	}

	:global(.mention) {
		color: var(--color-primary);
		font-weight: 500;
	}

	.activity-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 0.5rem;
	}

	.tag {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		background: color-mix(in srgb, var(--color-primary) 10%, transparent);
		color: var(--color-primary);
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.activity-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}
</style>
