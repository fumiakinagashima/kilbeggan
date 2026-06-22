<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/auth/signin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});

			const data = await res.json() as { error?: string };

			if (!res.ok) {
				error = data.error ?? 'エラーが発生しました';
				return;
			}

			await goto('/');
		} finally {
			loading = false;
		}
	}
</script>

<div class="page">
	<div class="card">
		<h1 class="logo">Boann</h1>
		<p class="tagline">活動記録をもっとシンプルに</p>

		<form onsubmit={submit}>
			{#if error}
				<p class="error">{error}</p>
			{/if}

			<div class="field">
				<label for="email">メールアドレス</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					autocomplete="email"
					required
					disabled={loading}
				/>
			</div>

			<div class="field">
				<label for="password">パスワード</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					autocomplete="current-password"
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" class="btn-primary" disabled={loading}>
				{loading ? 'ログイン中...' : 'ログイン'}
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
		background: var(--color-bg);
		padding: 1.5rem;
	}

	.card {
		width: 100%;
		max-width: 400px;
	}

	.logo {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--color-text);
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
