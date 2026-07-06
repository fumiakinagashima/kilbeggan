<script lang="ts">
	import { createSignInState } from './index.svelte.ts';

	const state = createSignInState();
</script>

<div class="signin-page">
	<form class="signin-card" onsubmit={(e) => state.submit(e)}>
		<h1>サインイン</h1>

		<div class="field">
			<label for="email">メールアドレス</label>
			<input
				id="email"
				type="email"
				bind:value={state.email}
				autocomplete="email"
				required
				disabled={state.loading}
			/>
		</div>

		<div class="field">
			<label for="password">パスワード</label>
			<input
				id="password"
				type="password"
				bind:value={state.password}
				autocomplete="current-password"
				required
				disabled={state.loading}
			/>
		</div>

		{#if state.error}
			<p class="error">{state.error}</p>
		{/if}

		<button
			type="submit"
			class="submit-btn"
			disabled={state.loading || !state.email || !state.password}
		>
			{state.loading ? 'ログイン中...' : 'ログイン'}
		</button>
	</form>
</div>

<style lang="scss">
	.signin-page {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 100vh;
		padding: 24px;
	}

	.signin-card {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		max-width: 360px;
		padding: 32px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
	}

	h1 {
		margin: 0 0 4px;
		font-size: 1.25rem;
		font-weight: 700;
		text-align: center;
		color: var(--color-text);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;

		label {
			font-size: 0.875rem;
			color: var(--color-text-muted);
		}

		input {
			padding: 8px 10px;
			border: 1px solid var(--color-border);
			border-radius: 6px;
			background: var(--color-background);
			color: var(--color-text);
			font-size: 0.9375rem;
			outline: none;
			transition: border-color 0.15s;

			&:focus {
				border-color: var(--color-primary);
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}

	.error {
		margin: 0;
		font-size: 0.875rem;
		color: var(--color-danger);
	}

	.submit-btn {
		padding: 9px 14px;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}
</style>
