<script lang="ts">
	import { goto } from '$app/navigation';

	let company = $state('');
	let phone = $state('');
	let email = $state('');
	let notes = $state('');
	let error = $state('');
	let loading = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const res = await fetch('/api/customers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					company,
					phone: phone || null,
					email: email || null,
					notes: notes || null
				})
			});
			const data = (await res.json()) as { id?: string; error?: string };

			if (!res.ok) {
				error = data.error ?? 'エラーが発生しました';
				return;
			}
			goto(`/customers/${data.id}`);
		} finally {
			loading = false;
		}
	}
</script>

<div class="page">
	<header class="page-header">
		<a href="/customers" class="back">← 戻る</a>
		<h1>顧客を追加</h1>
	</header>

	<form onsubmit={submit}>
		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="field">
			<label for="company">会社名 <span class="required">*</span></label>
			<input id="company" type="text" bind:value={company} required disabled={loading} />
		</div>

		<div class="field">
			<label for="phone">電話番号</label>
			<input id="phone" type="tel" bind:value={phone} disabled={loading} />
		</div>

		<div class="field">
			<label for="email">メール</label>
			<input id="email" type="email" bind:value={email} disabled={loading} />
		</div>

		<div class="field">
			<label for="notes">備考</label>
			<textarea id="notes" rows="3" bind:value={notes} disabled={loading}></textarea>
		</div>

		<button type="submit" class="btn-primary" disabled={loading}>
			{loading ? '保存中...' : '保存'}
		</button>
	</form>
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

		.back {
			display: block;
			font-size: 0.875rem;
			color: var(--color-primary);
			text-decoration: none;
			margin-bottom: 0.5rem;
		}

		h1 {
			font-size: 1.125rem;
			font-weight: 700;
		}
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
		}

		input,
		textarea {
			padding: 0.75rem 1rem;
			border: 1px solid var(--color-border);
			border-radius: 8px;
			font-size: 1rem;
			background: var(--color-surface);
			color: var(--color-text);
			outline: none;
			font-family: inherit;
			width: 100%;
			transition: border-color 0.15s;

			&:focus {
				border-color: var(--color-primary);
			}

			&:disabled {
				opacity: 0.6;
			}
		}

		textarea {
			resize: vertical;
		}
	}

	.required {
		color: var(--color-error);
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
