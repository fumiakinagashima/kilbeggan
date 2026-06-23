<script lang="ts">
	import { RefreshCw } from '@lucide/svelte';

	let { data } = $props();

	let teamSummary = $state(data.teamSummary);
	let summaryUpdatedAt = $state(data.summaryUpdatedAt);
	let generating = $state(false);

	async function refreshSummary() {
		generating = true;
		try {
			const res = await fetch('/api/dashboard/summarize', { method: 'POST' });
			if (res.ok) {
				const result = (await res.json()) as { summary: string; updatedAt: string };
				teamSummary = result.summary;
				summaryUpdatedAt = result.updatedAt;
			}
		} finally {
			generating = false;
		}
	}

	function formatDate(iso: string | null) {
		if (!iso) return '';
		return new Date(iso).toLocaleString('ja-JP', {
			month: 'numeric',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatLastActivity(date: Date | string | null) {
		if (!date) return '接触記録なし';
		return `最終: ${new Date(date).toLocaleDateString('ja-JP')}`;
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>ダッシュボード</h1>
	</header>

	<div class="stats-grid">
		<div class="stat-card">
			<span class="stat-value">{data.stats.total7days}</span>
			<span class="stat-label">活動（7日間）</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{data.stats.uniqueCustomers7days}</span>
			<span class="stat-label">接触顧客（7日間）</span>
		</div>
		<div class="stat-card">
			<span class="stat-value">{data.stats.totalCustomers}</span>
			<span class="stat-label">顧客総数</span>
		</div>
		<div class="stat-card" class:has-alert={data.stats.alertCount > 0}>
			<span class="stat-value">{data.stats.alertCount}</span>
			<span class="stat-label">要フォロー</span>
		</div>
	</div>

	<section class="summary-section">
		<div class="section-header">
			<div class="section-title">
				<h2>チームサマリー</h2>
				<span class="section-sub">直近7日間</span>
			</div>
			<div class="header-right">
				{#if summaryUpdatedAt}
					<span class="updated-at">{formatDate(summaryUpdatedAt)}</span>
				{/if}
				<button class="btn-refresh" onclick={refreshSummary} disabled={generating}>
					<RefreshCw size={13} class={generating ? 'spinning' : ''} />
					{generating ? '生成中...' : '更新'}
				</button>
			</div>
		</div>
		{#if teamSummary}
			<p class="summary-text">{teamSummary}</p>
		{:else}
			<p class="summary-empty">「更新」ボタンを押すと、直近7日間の活動からAIがサマリーを生成します。</p>
		{/if}
	</section>

	{#if data.alertCustomers.length > 0}
		<section class="alert-section">
			<div class="section-header">
				<div class="section-title">
					<h2>要フォロー顧客</h2>
					<span class="section-sub">30日以上未接触</span>
				</div>
			</div>
			<ul class="alert-list">
				{#each data.alertCustomers as customer (customer.id)}
					<li>
						<a href="/customers/{customer.id}" class="alert-item">
							<span class="alert-company">{customer.company}</span>
							<span class="alert-date">{formatLastActivity(customer.lastActivityAt)}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<section class="alert-section">
			<div class="section-header">
				<div class="section-title">
					<h2>要フォロー顧客</h2>
					<span class="section-sub">30日以上未接触</span>
				</div>
			</div>
			<p class="no-alert">現在、要フォローの顧客はいません。</p>
		</section>
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
		padding: 1.25rem 0 1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1.25rem;

		h1 {
			font-size: 1.125rem;
			font-weight: 700;
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.5rem;

		@media (min-width: 480px) {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 1rem 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		text-align: center;

		&.has-alert {
			border-color: color-mix(in srgb, #f59e0b 50%, transparent);
			background: color-mix(in srgb, #f59e0b 6%, var(--color-surface));

			.stat-value {
				color: #b45309;
			}
		}
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.summary-section,
	.alert-section {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		gap: 0.5rem;
	}

	.section-title {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;

		h2 {
			font-size: 0.9375rem;
			font-weight: 600;
		}
	}

	.section-sub {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex-shrink: 0;
	}

	.updated-at {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.btn-refresh {
		display: flex;
		align-items: center;
		gap: 0.3rem;
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

	:global(.spinning) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.summary-text {
		font-size: 0.9375rem;
		line-height: 1.65;
		color: var(--color-text);
	}

	.summary-empty,
	.no-alert {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.alert-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.alert-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		transition: background 0.1s;

		&:hover {
			background: color-mix(in srgb, var(--color-border) 30%, var(--color-background));
		}
	}

	.alert-company {
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.alert-date {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}
</style>
