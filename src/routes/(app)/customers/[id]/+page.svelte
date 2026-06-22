<script lang="ts">
	import { timeAgo } from '$lib/datetime';
	import { parseBody } from '$lib/body';

	let { data } = $props();
</script>

<div class="page">
	<header class="page-header">
		<a href="/customers" class="back">← 顧客一覧</a>
		<h1>{data.customer.company}</h1>
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

	<section class="history">
		<h2>活動履歴</h2>
		{#if data.activities.length === 0}
			<p class="empty">まだ活動記録がありません</p>
		{:else}
			<ul class="activity-list">
				{#each data.activities as activity (activity.id)}
					<li class="activity-item">
						<p class="activity-body">
							{#each parseBody(activity.body) as seg, i (i)}
								{#if seg.type === 'text'}
									{seg.text}
								{:else}
									<span class="mention">@{seg.name}</span>
								{/if}
							{/each}
						</p>
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

		h1 {
			font-size: 1.25rem;
			font-weight: 700;
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

	.mention {
		color: var(--color-primary);
		font-weight: 500;
	}

	.activity-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}
</style>
