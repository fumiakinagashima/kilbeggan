<script lang="ts">
	import { createSignInState } from './index.svelte.ts';

	const state = createSignInState();
</script>

<div class="page">
	<div class="card">
		<h1 class="logo">Kilbeggan</h1>
		<p class="tagline">サインイン</p>

		<form onsubmit={(e) => state.submit(e)}>
			{#if state.error}
				<p class="error">{state.error}</p>
			{/if}

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

			<button type="submit" class="btn-primary" disabled={state.loading}>
				{state.loading ? 'ログイン中...' : 'ログイン'}
			</button>
		</form>
	</div>
</div>

<style lang="scss">
	.page {
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-background);
		padding: 1.5rem;
	}

	.card {
		width: 100%;
		max-width: 400px;
	}

	.logo {
		font-size: 2rem;
		color: var(--color-primary);
		font-family: Georgia, 'Times New Roman', Times, serif;
		font-weight: 700;
		letter-spacing: -0.03em;
		margin: 0 0 0.25rem;
	}

	.tagline {
		font-size: 0.875rem;
		color: var(--color-text-muted);
		margin: 0 0 2rem;
	}

	.error {
		font-size: 0.875rem;
		color: var(--color-error);
		background: var(--color-error-bg);
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 1rem;

		label {
			font-size: 0.875rem;
			font-weight: 500;
			color: var(--color-text);
		}

		input {
			width: 100%;
			padding: 0.75rem 1rem;
			border: 1px solid var(--color-border);
			border-radius: 8px;
			font-size: 1rem;
			background: var(--color-surface);
			color: var(--color-text);
			outline: none;
			box-sizing: border-box;
			transition: border-color 0.15s;

			&:focus {
				border-color: var(--color-primary);
			}

			&:disabled {
				opacity: 0.6;
			}
		}
	}

	.btn-primary {
		width: 100%;
		padding: 0.875rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: opacity 0.15s;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}
</style>
