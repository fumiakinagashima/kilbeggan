<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { PenLine, List, Users, Settings } from '@lucide/svelte';

	let { children }: { children: Snippet } = $props();

	const navItems = [
		{ href: '/', label: '投稿', icon: PenLine, exact: true },
		{ href: '/fields', label: '活動', icon: List, exact: false },
		{ href: '/customers', label: '顧客', icon: Users, exact: false },
		{ href: '/settings', label: '設定', icon: Settings, exact: false }
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
		<span class="logo">Kilbeggan</span>
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
			background: var(--sidebar-bg);
			border-right: 1px solid var(--sidebar-border);
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
		color: var(--sidebar-text-muted);
		text-decoration: none;
		transition:
			background 0.1s,
			color 0.1s;

		&:hover {
			background: var(--sidebar-hover);
			color: var(--sidebar-text);
		}

		&.active {
			background: var(--sidebar-active);
			color: var(--color-primary);
		}
	}

	.theme-switcher {
		display: flex;
		border: 1px solid var(--sidebar-border);
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 0.5rem;

		button {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 0.4rem;
			background: none;
			border: none;
			cursor: pointer;
			color: var(--sidebar-text-muted);
			transition: background 0.1s, color 0.1s;

			&:hover {
				background: var(--sidebar-hover);
				color: var(--sidebar-text);
			}

			&.active {
				background: var(--sidebar-active);
				color: var(--color-primary);
			}
		}
	}

	.signout {
		display: flex;
		align-items: center;
		padding: 0.625rem 0.75rem;
		border: none;
		background: none;
		color: var(--sidebar-text-muted);
		font-size: 0.875rem;
		cursor: pointer;
		border-radius: 8px;
		width: 100%;
		text-align: left;

		&:hover {
			background: var(--sidebar-hover);
			color: var(--sidebar-text);
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
		background: var(--sidebar-bg);
		border-top: 1px solid var(--sidebar-border);
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
		color: var(--sidebar-text-muted);
		font-size: 0.6875rem;
		font-weight: 500;

		&.active {
			color: var(--color-primary);
		}
	}
</style>
