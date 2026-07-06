<script lang="ts">
	import type { Snippet } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import '$lib/styles/app.scss';
	import favicon from '$lib/assets/favicon.svg';
	import { themeStore } from '$lib/stores/theme.svelte';

	let { children }: { children: Snippet } = $props();

	// vite-plugin-pwaはService Worker登録スクリプトは自動でHTMLに注入するが、
	// <link rel="manifest">タグは注入しないため手動で追加する
	let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	$effect(() => {
		const root = document.documentElement;
		if (themeStore.value === 'system') {
			root.removeAttribute('data-theme');
		} else {
			root.setAttribute('data-theme', themeStore.value);
		}
		try {
			localStorage.setItem('theme', themeStore.value);
		} catch (_) {}
	});
</script>

<svelte:head>
	<title>Kilbeggan</title>
	<link rel="icon" href={favicon} />
	{@html webManifestLink}
</svelte:head>

{@render children()}
