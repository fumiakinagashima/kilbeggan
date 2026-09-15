<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { createSettingsState } from './index.svelte.ts';

	let { data } = $props();
	const state = createSettingsState(() => data);
</script>

<div class="page">
	<header class="page-header">
		<h1>Settings</h1>
	</header>

	<section class="card">
		<h2>Theme</h2>
		<div class="theme-switcher">
			<button
				class="theme-btn"
				class:active={themeStore.value === 'light'}
				onclick={() => (themeStore.value = 'light')}
			>
				<Sun size={16} />
				Light
			</button>
			<button
				class="theme-btn"
				class:active={themeStore.value === 'system'}
				onclick={() => (themeStore.value = 'system')}
			>
				<Monitor size={16} />
				System
			</button>
			<button
				class="theme-btn"
				class:active={themeStore.value === 'dark'}
				onclick={() => (themeStore.value = 'dark')}
			>
				<Moon size={16} />
				Dark
			</button>
		</div>
	</section>

	{#if state.pushSupported}
		<section class="card">
			<h2>Push Notifications</h2>

			{#if state.pushMessage}
				<p
					class="message"
					class:success={state.pushMessage.type === 'success'}
					class:error={state.pushMessage.type === 'error'}
				>
					{state.pushMessage.text}
				</p>
			{/if}

			<p class="field-hint">
				Deliver notifications like reminders to this device as push notifications.
			</p>
			<div class="footer">
				<button
					class="btn-primary"
					class:btn-outline={state.pushSubscribed}
					onclick={state.togglePush}
					disabled={state.pushSubmitting}
				>
					{state.pushSubmitting
						? 'Processing...'
						: state.pushSubscribed
							? 'Disable Push Notifications'
							: 'Enable Push Notifications'}
				</button>
			</div>
		</section>
	{/if}

	<section class="card">
		<h2>Profile</h2>

		{#if state.profileMessage}
			<p
				class="message"
				class:success={state.profileMessage.type === 'success'}
				class:error={state.profileMessage.type === 'error'}
			>
				{state.profileMessage.text}
			</p>
		{/if}

		<div class="field">
			<label for="profile-name">Name</label>
			<input id="profile-name" type="text" bind:value={state.profileName} />
		</div>
		<div class="field">
			<label for="profile-email">Email Address</label>
			<input id="profile-email" type="email" bind:value={state.profileEmail} />
		</div>
		<div class="footer">
			<button
				class="btn-primary"
				onclick={state.saveProfile}
				disabled={state.profileSubmitting ||
					!state.profileName.trim() ||
					!state.profileEmail.trim()}
			>
				{state.profileSubmitting ? 'Saving...' : 'Save'}
			</button>
		</div>
	</section>

	<section class="card">
		<h2>Change Password</h2>

		{#if state.passwordMessage}
			<p
				class="message"
				class:success={state.passwordMessage.type === 'success'}
				class:error={state.passwordMessage.type === 'error'}
			>
				{state.passwordMessage.text}
			</p>
		{/if}

		<div class="field">
			<label for="current-password">Current Password</label>
			<input id="current-password" type="password" bind:value={state.currentPassword} />
		</div>
		<div class="field">
			<label for="new-password">New Password <span class="hint">(8+ characters)</span></label>
			<input id="new-password" type="password" bind:value={state.newPassword} />
		</div>
		<div class="field">
			<label for="confirm-password">New Password (Confirm)</label>
			<input id="confirm-password" type="password" bind:value={state.confirmPassword} />
		</div>
		<div class="footer">
			<button
				class="btn-primary"
				onclick={state.savePassword}
				disabled={state.passwordSubmitting ||
					!state.currentPassword ||
					!state.newPassword ||
					!state.confirmPassword}
			>
				{state.passwordSubmitting ? 'Changing...' : 'Change'}
			</button>
		</div>
	</section>

	{#if state.isAdmin}
		<section class="card">
			<h2>Admin Settings</h2>

			{#if state.followUpMessage}
				<p
					class="message"
					class:success={state.followUpMessage.type === 'success'}
					class:error={state.followUpMessage.type === 'error'}
				>
					{state.followUpMessage.text}
				</p>
			{/if}

			<div class="field">
				<label for="follow-up-days">Days Without Contact for "Needs Follow-up"</label>
				<div class="input-with-unit">
					<input
						id="follow-up-days"
						type="number"
						min="1"
						max="365"
						bind:value={state.followUpDays}
					/>
					<span class="unit">days</span>
				</div>
				<p class="field-hint">
					Customers with no contact for this many days or more are shown as "Needs Follow-up"
				</p>
			</div>
			<div class="footer">
				<button
					class="btn-primary"
					onclick={state.saveFollowUpDays}
					disabled={state.followUpSubmitting || !state.followUpDays}
				>
					{state.followUpSubmitting ? 'Saving...' : 'Save'}
				</button>
			</div>
		</section>
	{/if}

	<button class="btn-signout" onclick={state.signout}>Sign Out</button>
</div>

<style lang="scss">
	.page {
		max-width: 560px;
		margin: 0 auto;
		padding: 0 1rem 2rem;

		@media (min-width: 768px) {
			padding: 0 2rem 2rem;
		}
	}

	.page-header {
		padding: 1.25rem 0 1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1.5rem;

		h1 {
			font-size: 1.125rem;
			font-weight: 700;
		}
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.25rem;
		margin-bottom: 1rem;

		h2 {
			font-size: 0.9375rem;
			font-weight: 600;
			margin-bottom: 1rem;
		}
	}

	.theme-switcher {
		display: flex;
		gap: 0.5rem;
	}

	.theme-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.375rem;
		padding: 0.625rem 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-background);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.1s,
			color 0.1s,
			border-color 0.1s;

		&:hover {
			background: var(--color-surface);
			color: var(--color-text);
		}

		&.active {
			border-color: var(--color-primary);
			background: color-mix(in srgb, var(--color-primary) 10%, transparent);
			color: var(--color-primary);
		}
	}

	.message {
		font-size: 0.875rem;
		padding: 0.625rem 0.875rem;
		border-radius: 8px;
		margin-bottom: 1rem;

		&.success {
			background: color-mix(in srgb, #22c55e 12%, transparent);
			color: #15803d;
			border: 1px solid color-mix(in srgb, #22c55e 30%, transparent);
		}

		&.error {
			background: var(--color-error-bg);
			color: var(--color-error);
			border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 1rem;

		label {
			font-size: 0.875rem;
			font-weight: 500;
		}

		input {
			padding: 0.75rem 1rem;
			border: 1px solid var(--color-border);
			border-radius: 8px;
			font-size: 1rem;
			background: var(--color-background);
			color: var(--color-text);
			outline: none;
			width: 100%;
			transition: border-color 0.15s;
			font-family: inherit;

			&:focus {
				border-color: var(--color-primary);
			}

			&:disabled {
				opacity: 0.6;
			}
		}
	}

	.hint {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.input-with-unit {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		input {
			width: 6rem;
		}
	}

	.unit {
		font-size: 0.9375rem;
		color: var(--color-text-muted);
	}

	.field-hint {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		margin-top: 0.25rem;
	}

	.footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 0.25rem;
	}

	.btn-primary {
		padding: 0.75rem 1.5rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;

		&.btn-outline {
			background: none;
			border: 1px solid var(--color-border);
			color: var(--color-text);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.btn-signout {
		display: none;
		width: 100%;
		padding: 0.875rem;
		background: none;
		border: 1px solid var(--color-text-muted);
		border-radius: 8px;
		color: var(--color-text-muted);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: background 0.15s;

		&:hover {
			background: color-mix(in srgb, var(--color-text-muted) 8%, transparent);
		}

		@media (max-width: 767px) {
			display: block;
		}
	}
</style>
