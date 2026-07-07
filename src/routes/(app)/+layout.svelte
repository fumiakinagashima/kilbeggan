<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { List, Users, Settings, LogOut, Bell, Clock, UserCog } from '@lucide/svelte';
	import { notificationCenter } from '$lib/stores/notifications.svelte';
	import { NOTIFICATION_POLL_INTERVAL_MS } from '$lib/constants';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const baseNavItems = [
		{ href: '/', label: '活動', icon: List, exact: true, prefixes: ['/fields'] },
		{ href: '/customers', label: '顧客', icon: Users, exact: false },
		{ href: '/settings', label: '設定', icon: Settings, exact: false }
	];

	// 管理者権限かつデスクトップ表示のみ。モバイルのボトムナビには出さない
	const desktopNavItems = $derived(
		data.user?.role === 'admin'
			? [
					...baseNavItems,
					{ href: '/accounts', label: 'アカウント管理', icon: UserCog, exact: false }
				]
			: baseNavItems
	);

	const bottomNavItems = [
		baseNavItems[0],
		baseNavItems[1],
		{ href: '/notifications', label: '通知', icon: Bell, exact: false },
		{ href: '/reminder', label: 'リマインダー', icon: Clock, exact: false },
		baseNavItems[2]
	];

	function isActive(item: { href: string; exact: boolean; prefixes?: string[] }): boolean {
		const path = page.url.pathname;
		if (item.exact ? path === item.href : path.startsWith(item.href)) return true;
		return (item.prefixes ?? []).some((p) => path.startsWith(p));
	}

	async function signout() {
		await fetch('/api/auth/signout', { method: 'POST' });
		goto('/signin');
	}

	function formatBadgeCount(count: number): string {
		return count > 99 ? '99+' : String(count);
	}

	$effect(() => {
		notificationCenter.refreshUnreadCount();
		const interval = setInterval(() => {
			notificationCenter.refreshUnreadCount();
		}, NOTIFICATION_POLL_INTERVAL_MS);
		return () => clearInterval(interval);
	});
</script>

<div class="shell">
	<aside class="sidebar">
		<div class="sidebar-header">
			<span class="logo">KILBEGGAN</span>
		</div>

		<nav class="nav">
			{#each desktopNavItems as item (item.href)}
				<a href={item.href} class="nav-item" class:active={isActive(item)}>
					<item.icon size={16} />
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="sidebar-footer">
			<a
				href="/notifications"
				class="footer-item"
				class:active={isActive({ href: '/notifications', exact: false })}
			>
				<Bell size={15} />
				通知
				{#if notificationCenter.unreadCount > 0}
					<span class="notification-badge">{formatBadgeCount(notificationCenter.unreadCount)}</span>
				{/if}
			</a>

			<a
				href="/reminder"
				class="footer-item"
				class:active={isActive({ href: '/reminder', exact: false })}
			>
				<Clock size={15} />
				リマインダー
			</a>

			{#if data.user}
				<div class="account-row">
					<span class="account-name">{data.user.name}</span>
					<button class="signout-btn" onclick={signout} title="ログアウト" aria-label="ログアウト">
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
		{#each bottomNavItems as item (item.href)}
			<a href={item.href} class="bottom-nav-item" class:active={isActive(item)}>
				<span class="icon-wrap">
					<item.icon size={22} />
					{#if item.href === '/notifications' && notificationCenter.unreadCount > 0}
						<span class="bottom-nav-badge">{formatBadgeCount(notificationCenter.unreadCount)}</span>
					{/if}
				</span>
				<span class="label">{item.label}</span>
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
		background-color: var(--sidebar-bg);

		@media (min-width: 768px) {
			display: flex;
			flex-direction: column;
			width: var(--sidebar-width);
			height: 100vh;
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
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.footer-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		border-radius: 8px;
		font-size: 0.875rem;
		color: var(--sidebar-text-muted);
		text-decoration: none;
		transition:
			background 0.15s,
			color 0.15s;

		&:hover {
			background: var(--sidebar-hover);
			color: var(--sidebar-text);
		}

		&.active {
			color: var(--color-primary);
		}
	}

	.notification-badge {
		margin-left: auto;
		min-width: 18px;
		padding: 1px 5px;
		border-radius: 999px;
		background: var(--color-primary);
		color: #fff;
		font-size: 0.6875rem;
		font-weight: 700;
		line-height: 1.4;
		text-align: center;
	}

	.account-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		margin-top: 4px;
		border-top: 1px solid var(--sidebar-border);
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
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
		padding: 0 2px;
		text-decoration: none;
		color: var(--sidebar-text-muted);
		font-size: 0.625rem;
		font-weight: 500;

		.label {
			max-width: 100%;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		&.active {
			color: var(--color-primary);
		}
	}

	.icon-wrap {
		position: relative;
	}

	.bottom-nav-badge {
		position: absolute;
		top: -4px;
		right: -8px;
		min-width: 14px;
		padding: 0 3px;
		border-radius: 999px;
		background: var(--color-primary);
		color: #fff;
		font-size: 0.5625rem;
		font-weight: 700;
		line-height: 14px;
		text-align: center;
	}
</style>
