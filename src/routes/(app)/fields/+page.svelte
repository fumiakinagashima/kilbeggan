<script lang="ts">
	import { timeAgo } from '$lib/datetime';
	import { bodyToHtml } from '$lib/body';
	import { Lock, X } from '@lucide/svelte';
	import { createFieldsState } from './index.svelte.ts';

	let { data } = $props();
	const feed = createFieldsState(() => data);

	let lightboxSrc = $state<string | null>(null);

	function isImage(key: string) {
		return /\.(jpg|jpeg|png|gif|webp|avif|heic|heif)$/i.test(key);
	}

	function closeLightbox() {
		lightboxSrc = null;
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>活動一覧</h1>
	</header>

	{#if feed.allActivities.length === 0}
		<p class="empty">まだ活動記録がありません</p>
	{:else}
		<ul class="feed">
			{#each feed.allActivities as activity (activity.id)}
				<li class="card" class:private-card={activity.isPrivate}>
					<p class="body">{@html bodyToHtml(activity.body)}</p>

					{#if activity.tags && activity.tags.length > 0}
						<div class="tags">
							{#each activity.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					{/if}

					{#if activity.attachments && activity.attachments.length > 0}
						<div class="attachments">
							{#each activity.attachments as att (att.key)}
								{#if isImage(att.key)}
									<button
										type="button"
										class="thumb-btn"
										onclick={() => (lightboxSrc = `/api/files/${att.key}`)}
									>
										<img src={`/api/files/${att.key}`} alt={att.name} />
									</button>
								{:else}
									<a
										href={`/api/files/${att.key}`}
										target="_blank"
										rel="noopener noreferrer"
										class="file-chip"
									>
										📄 {att.name}
									</a>
								{/if}
							{/each}
						</div>
					{/if}

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
									onclick={() => feed.togglePrivacy(activity.id, activity.isPrivate)}
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

{#if lightboxSrc}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
	<div
		class="lightbox"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={closeLightbox}
		onkeydown={(e) => { if (e.key === 'Escape') closeLightbox(); }}
	>
		<button class="lightbox-close" onclick={closeLightbox} aria-label="閉じる">
			<X size={24} />
		</button>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="lightbox-content" onclick={(e) => e.stopPropagation()}>
			<img src={lightboxSrc} alt="" />
		</div>
	</div>
{/if}

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

	.tags {
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

	.attachments {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 0.625rem;
	}

	.thumb-btn {
		padding: 0;
		border: none;
		background: none;
		cursor: zoom-in;
		border-radius: 8px;
		overflow: hidden;
		flex-shrink: 0;

		img {
			display: block;
			width: 80px;
			height: 80px;
			object-fit: cover;
			border-radius: 8px;
			transition: opacity 0.15s;
		}

		&:hover img {
			opacity: 0.85;
		}
	}

	.file-chip {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.625rem;
		background: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-decoration: none;
		max-width: 180px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		&:hover {
			color: var(--color-text);
		}
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

	.lightbox {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.88);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		cursor: zoom-out;
	}

	.lightbox-content {
		cursor: default;

		img {
			display: block;
			max-width: min(90vw, 960px);
			max-height: 90vh;
			object-fit: contain;
			border-radius: 4px;
		}
	}

	.lightbox-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		cursor: pointer;

		&:hover {
			background: rgba(0, 0, 0, 0.75);
		}
	}
</style>
