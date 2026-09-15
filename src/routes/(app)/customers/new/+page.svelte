<script lang="ts">
	import CustomerFormFields from '$lib/components/CustomerFormFields.svelte';
	import { createCustomerNewState } from './index.svelte.ts';

	const state = createCustomerNewState();
</script>

<div class="page">
	<header class="page-header">
		<a href="/customers" class="back">← Back</a>
		<h1>Add customer</h1>
	</header>

	<form onsubmit={(e) => state.submit(e)}>
		{#if state.error}
			<p class="error">{state.error}</p>
		{/if}

		<CustomerFormFields
			bind:company={state.company}
			bind:phone={state.phone}
			bind:email={state.email}
			bind:notes={state.notes}
			disabled={state.loading}
		/>

		<button type="submit" class="btn-primary" disabled={state.loading}>
			{state.loading ? 'Saving...' : 'Save'}
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
