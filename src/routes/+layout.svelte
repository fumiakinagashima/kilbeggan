<script lang="ts">
	import type { Snippet } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style lang="scss">
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'Hiragino Sans',
			'Noto Sans JP',
			sans-serif;
		background: var(--color-bg);
		color: var(--color-text);
		-webkit-font-smoothing: antialiased;
	}

	:global(:root) {
		--color-primary: #2563eb;
		--color-bg: #f8fafc;
		--color-surface: #ffffff;
		--color-border: #e2e8f0;
		--color-text: #0f172a;
		--color-text-muted: #64748b;
		--color-error: #dc2626;
		--color-error-bg: #fef2f2;

		--nav-height-mobile: 56px;
		--sidebar-width: 240px;
	}
</style>
