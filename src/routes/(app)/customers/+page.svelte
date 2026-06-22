<script lang="ts">
	import { Plus, ChevronRight } from '@lucide/svelte';

	let { data } = $props();
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
							<span class="name">{customer.company}</span>
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
	}

	.item-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.name {
		font-size: 0.9375rem;
		font-weight: 600;
	}

	:global(.chevron) {
		color: var(--color-text-muted);
		flex-shrink: 0;
	}
</style>
