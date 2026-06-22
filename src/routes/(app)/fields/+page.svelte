<script lang="ts">
	import { timeAgo } from '$lib/datetime';
	import { parseBody } from '$lib/body';
	import { Lock } from '@lucide/svelte';

	let { data } = $props();

	let privacyMap = $state<Record<string, boolean>>({});
	let allActivities = $derived(
		data.activities.map((a) => ({
			...a,
			isPrivate: a.id in privacyMap ? privacyMap[a.id] : a.isPrivate
		}))
	);

	async function togglePrivacy(activityId: string, current: boolean) {
		const next = !current;
		privacyMap = { ...privacyMap, [activityId]: next };
		const res = await fetch(`/api/activities/${activityId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isPrivate: next })
		});
		if (!res.ok) {
			const copy = { ...privacyMap };
			delete copy[activityId];
			privacyMap = copy;
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>活動一覧</h1>
	</header>

	{#if allActivities.length === 0}
		<p class="empty">まだ活動記録がありません</p>
	{:else}
		<ul class="feed">
			{#each allActivities as activity (activity.id)}
				<li class="card" class:private-card={activity.isPrivate}>
					<p class="body">
						{#each parseBody(activity.body) as seg, i (i)}
							{#if seg.type === 'text'}
								{seg.text}
							{:else}
								<span class="mention">@{seg.name}</span>
							{/if}
						{/each}
					</p>
					<div class="meta">
						<span class="author">{activity.userName ?? ''}</span>
						<div class="meta-right">
							{#if activity.isPrivate}
								<span class="private-badge"><Lock size={11} />非公開</span>
							{/if}
							{#if data.user?.userId === activity.userId}
								<a href="/fields/{activity.id}" class="edit-link">編集</a>
								<button
									class="visibility-btn"
									onclick={() => togglePrivacy(activity.id, activity.isPrivate)}
								>
									{activity.isPrivate ? '公開する' : '非公開にする'}
								</button>
							{/if}
							<span>{timeAgo(new Date(activity.createdAt))}</span>
						</div>
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
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;

		&.private-card {
			background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
			border-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
		}
	}

	.body {
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

	.meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		gap: 0.5rem;
	}

	.meta-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.private-badge {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		color: var(--color-primary);
		font-size: 0.75rem;
	}

	.edit-link {
		font-size: 0.75rem;
		color: var(--color-primary);
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}

	.visibility-btn {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;

		&:hover {
			color: var(--color-text);
		}
	}
</style>
