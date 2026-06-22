<script lang="ts">
	let { data, form } = $props();

	let company = $state(data.customer.company);
	let phone = $state(data.customer.phone ?? '');
	let email = $state(data.customer.email ?? '');
	let notes = $state(data.customer.notes ?? '');
	let submitting = $state(false);
</script>

<div class="page">
	<header class="page-header">
		<a href="/customers/{data.customer.id}" class="back">← 戻る</a>
		<h1>顧客を編集</h1>
	</header>

	{#if form?.error}
		<p class="error">{form.error}</p>
	{/if}

	<form method="POST" onsubmit={() => (submitting = true)}>
		<div class="field">
			<label for="company">会社名 <span class="required">*</span></label>
			<input id="company" name="company" type="text" bind:value={company} required disabled={submitting} />
		</div>

		<div class="field">
			<label for="phone">電話番号</label>
			<input id="phone" name="phone" type="tel" bind:value={phone} disabled={submitting} />
		</div>

		<div class="field">
			<label for="email">メール</label>
			<input id="email" name="email" type="email" bind:value={email} disabled={submitting} />
		</div>

		<div class="field">
			<label for="notes">備考</label>
			<textarea id="notes" name="notes" rows="4" bind:value={notes} disabled={submitting}></textarea>
		</div>

		<div class="footer">
			<a href="/customers/{data.customer.id}" class="btn-cancel">キャンセル</a>
			<button type="submit" class="btn-primary" disabled={submitting || !company.trim()}>
				{submitting ? '保存中...' : '保存'}
			</button>
		</div>
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

	.footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.btn-cancel {
		padding: 0.75rem 1.25rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 0.9375rem;
		color: var(--color-text-muted);
		text-decoration: none;
		background: var(--color-surface);

		&:hover {
			background: var(--color-bg);
		}
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

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}
</style>
