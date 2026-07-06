<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { PenLine, List, Users, Settings, LogOut } from '@lucide/svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

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
		<div class="sidebar-header">
			<span class="logo">KILBEGGAN</span>
		</div>

		<nav class="nav">
			{#each navItems as item (item.href)}
				<a href={item.href} class="nav-item" class:active={isActive(item.href, item.exact)}>
					<item.icon size={16} />
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			{#if data.user}
				<div class="account-row">
					<span class="account-name">{data.user.name}</span>
					<button
						class="signout-btn"
						onclick={signout}
						title="ログアウト"
						aria-label="ログアウト"
					>
						<LogOut size={15} />
					</button>
				</div>
			{/if}
		</div>
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
			background: var(--sidebar-bg);
			border-right: 1px solid var(--sidebar-border);
			position: sticky;
			top: 0;
			overflow: hidden;
		}
	}

	.sidebar-header {
		padding: 14px 12px 10px;
	}

	.logo {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-primary);
		padding: 0 4px;
		letter-spacing: -0.01em;
		font-family: Georgia, 'Times New Roman', Times, serif;
	}

	.nav {
		flex: 1;
		overflow-y: auto;
		padding: 4px 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-radius: 8px;
		font-size: 0.875rem;
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

	.sidebar-footer {
		padding: 8px;
		border-top: 1px solid var(--sidebar-border);
	}

	.account-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
	}

	.account-name {
		flex: 1;
		min-width: 0;
		font-size: 0.8125rem;
		color: var(--sidebar-text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.signout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		flex-shrink: 0;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--sidebar-text-muted);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;

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
