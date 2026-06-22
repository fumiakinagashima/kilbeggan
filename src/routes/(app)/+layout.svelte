<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Home, Users } from '@lucide/svelte';

	let { children }: { children: Snippet } = $props();

	const navItems = [
		{ href: '/', label: 'フィード', icon: Home, exact: true },
		{ href: '/customers', label: '顧客', icon: Users, exact: false }
	];

	function isActive(href: string, exact: boolean): boolean {
		return exact ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}

	async function signout() {
		await fetch('/api/auth/signout', { method: 'POST' });
		goto('/signin');
	}
</script>

<div class="shell">
	<aside class="sidebar">
		<span class="logo">Boann</span>
		<nav class="sidebar-nav">
			{#each navItems as item (item.href)}
				<a href={item.href} class="nav-link" class:active={isActive(item.href, item.exact)}>
					<item.icon size={20} />
					{item.label}
				</a>
			{/each}
		</nav>
		<button class="signout" onclick={signout}>ログアウト</button>
	</aside>

	<main class="content">
		{@render children()}
	</main>

	<nav class="bottom-nav">
		{#each navItems as item (item.href)}
			<a href={item.href} class="bottom-nav-item" class:active={isActive(item.href, item.exact)}>
				<item.icon size={24} />
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>
</div>

<style lang="scss">
	.shell {
		display: flex;
		min-height: 100dvh;
	}

	.sidebar {
		display: none;

		@media (min-width: 768px) {
			display: flex;
			flex-direction: column;
			width: var(--sidebar-width);
			min-height: 100dvh;
			padding: 1.5rem 1rem;
			background: var(--color-surface);
			border-right: 1px solid var(--color-border);
			position: sticky;
			top: 0;
		}
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-primary);
		padding: 0 0.5rem;
		margin-bottom: 1.5rem;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.625rem 0.75rem;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--color-text-muted);
		text-decoration: none;
		transition:
			background 0.1s,
			color 0.1s;

		&:hover {
			background: var(--color-bg);
			color: var(--color-text);
		}

		&.active {
			background: #eff6ff;
			color: var(--color-primary);
		}
	}

	.signout {
		display: flex;
		align-items: center;
		padding: 0.625rem 0.75rem;
		border: none;
		background: none;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		border-radius: 8px;
		width: 100%;
		text-align: left;

		&:hover {
			background: var(--color-bg);
			color: var(--color-text);
		}
	}

	.content {
		flex: 1;
		min-width: 0;
		padding-bottom: var(--nav-height-mobile);

		@media (min-width: 768px) {
			padding-bottom: 0;
		}
	}

	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: var(--nav-height-mobile);
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		display: flex;
		z-index: 100;

		@media (min-width: 768px) {
			display: none;
		}
	}

	.bottom-nav-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
		text-decoration: none;
		color: var(--color-text-muted);
		font-size: 0.6875rem;
		font-weight: 500;

		&.active {
			color: var(--color-primary);
		}
	}
</style>
