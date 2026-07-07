<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { timeAgo } from '$lib/datetime';
	import { notificationCenter } from '$lib/stores/notifications.svelte';

	notificationCenter.loadItems();
</script>

<div class="page">
	<header class="page-header">
		<h1>通知</h1>
	</header>

	{#if notificationCenter.items.length === 0}
		<p class="empty">通知はありません</p>
	{:else}
		<ul class="feed">
			{#each notificationCenter.items as item (item.id)}
				<li class="card" class:unread={!item.isRead}>
					<button
						type="button"
						class="delete-btn"
						onclick={() => notificationCenter.deleteNotification(item.id)}
						aria-label="削除"
					>
						<Trash2 size={15} />
					</button>
					<div
						class="notification-body"
						role="button"
						tabindex="0"
						onclick={() => notificationCenter.markRead(item.id)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') notificationCenter.markRead(item.id);
						}}
					>
						<div class="notification-title">
							{#if !item.isRead}<span class="unread-dot" aria-hidden="true"></span>{/if}
							{item.title}
						</div>
						<p class="body">{item.body}</p>
						<span class="date">{timeAgo(new Date(item.createdAt))}</span>
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
		padding: 1.25rem 0 1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1rem;

		h1 {
			font-size: 1.125rem;
			font-weight: 700;
		}
	}

	.empty {
		color: var(--color-text-muted);
		text-align: center;
		padding: 3rem 0;
		font-size: 0.9375rem;
	}

	.feed {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.card {
		position: relative;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;

		&.unread {
			background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
			border-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
		}
	}

	.delete-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		background: none;
		border: none;
		border-radius: 6px;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0;

		&:hover {
			background: var(--color-background);
			color: var(--color-text);
		}
	}

	.notification-body {
		cursor: pointer;
		padding-right: 2rem;
	}

	.notification-title {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text);
		margin-bottom: 0.375rem;
	}

	.unread-dot {
		flex-shrink: 0;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-primary);
	}

	.card.unread .notification-title {
		font-weight: 700;
	}

	.body {
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--color-text-muted);
		white-space: pre-wrap;
		word-break: break-word;
		margin-bottom: 0.5rem;
	}

	.date {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}
</style>
