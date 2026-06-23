<script lang="ts">
	import type { Snippet } from 'svelte';
	import '$lib/styles/app.scss';
	import favicon from '$lib/assets/favicon.svg';
	import { themeStore } from '$lib/stores/theme.svelte';

	let { children }: { children: Snippet } = $props();

	$effect(() => {
		const root = document.documentElement;
		if (themeStore.value === 'system') {
			root.removeAttribute('data-theme');
		} else {
			root.setAttribute('data-theme', themeStore.value);
		}
		localStorage.setItem('theme', themeStore.value);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
