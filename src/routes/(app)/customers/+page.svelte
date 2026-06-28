<script lang="ts">
	import { Plus, ChevronRight } from '@lucide/svelte';
	import { timeAgo } from '$lib/datetime';

	let { data } = $props();

	const STALE_MS = 30 * 24 * 60 * 60 * 1000;

	function isStale(date: Date | string | null) {
		if (!date) return true;
		return Date.now() - new Date(date).getTime() > STALE_MS;
	}

	function scoreLabel(score: number | null): string {
		if (score === null) return '';
		if (score >= 80) return 'hot';
		if (score >= 60) return 'warm';
		if (score >= 40) return 'neutral';
		return 'cold';
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>顧客</h1>
		<a href="/customers/new" class="btn-primary">
			<Plus size={18} />
			追加
		</a>
	</header>

	{#if data.customers.length === 0}
		<p class="empty">顧客がまだいません</p>
	{:else}
		<ul class="list">
			{#each data.customers as customer (customer.id)}
				<li>
					<a href="/customers/{customer.id}" class="item">
						<div class="item-info">
							<div class="item-name-row">
								<span class="name">{customer.company}</span>
								{#if customer.score !== null && customer.score !== undefined}
									<span class="score-badge {scoreLabel(customer.score)}">{customer.score}</span>
								{/if}
								{#if !customer.lastActivityAt || isStale(customer.lastActivityAt)}
									<span class="alert-badge">要フォロー</span>
								{/if}
							</div>
							<span class="last-contact">
								{customer.lastActivityAt
									? `最終接触: ${timeAgo(new Date(customer.lastActivityAt))}`
									: '接触記録なし'}
							</span>
						</div>
						<ChevronRight size={20} class="chevron" />
					</a>
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

	.btn-primary {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		background: var(--color-primary);
		color: #fff;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
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
		align-items: center;
		padding: 0.875rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		gap: 0.5rem;
		transition: background 0.1s;

		&:hover {
			background: color-mix(in srgb, var(--color-border) 30%, var(--color-surface));
		}
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-name-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	.score-badge {
		display: inline-block;
		padding: 0.1rem 0.45rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		border: 1px solid;

		&.hot {
			background: color-mix(in srgb, #22c55e 12%, transparent);
			color: #15803d;
			border-color: color-mix(in srgb, #22c55e 35%, transparent);
			:global([data-theme='dark']) & { color: #4ade80; }
		}
		&.warm {
			background: color-mix(in srgb, #3b82f6 10%, transparent);
			color: #1d4ed8;
			border-color: color-mix(in srgb, #3b82f6 30%, transparent);
			:global([data-theme='dark']) & { color: #60a5fa; }
		}
		&.neutral {
			background: color-mix(in srgb, #f59e0b 10%, transparent);
			color: #b45309;
			border-color: color-mix(in srgb, #f59e0b 30%, transparent);
			:global([data-theme='dark']) & { color: #fbbf24; }
		}
		&.cold {
			background: color-mix(in srgb, #6b7280 10%, transparent);
			color: #4b5563;
			border-color: color-mix(in srgb, #6b7280 25%, transparent);
			:global([data-theme='dark']) & { color: #9ca3af; }
		}
	}

	.alert-badge {
		display: inline-block;
		padding: 0.1rem 0.45rem;
		background: color-mix(in srgb, #f59e0b 15%, transparent);
		color: #b45309;
		border: 1px solid color-mix(in srgb, #f59e0b 40%, transparent);
		border-radius: 20px;
		font-size: 0.7rem;
		font-weight: 600;

		:global([data-theme='dark']) & {
			color: #fbbf24;
			background: color-mix(in srgb, #f59e0b 20%, transparent);
		}
	}

	.last-contact {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	:global(.chevron) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
</style>
