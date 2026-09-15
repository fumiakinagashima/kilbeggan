<script lang="ts">
	import { Plus, Trash2 } from '@lucide/svelte';
	import { createAccountsState } from './index.svelte.ts';

	let { data } = $props();
	const state = createAccountsState(() => data);
</script>

<div class="page">
	<header class="page-header">
		<h1>Account Management</h1>
		<button type="button" class="btn-add" onclick={() => state.toggleAddForm()}>
			<Plus size={14} />
			Add
		</button>
	</header>

	{#if state.showAddForm}
		<form class="add-form" onsubmit={(e) => state.createAccount(e)}>
			{#if state.addError}
				<p class="error">{state.addError}</p>
			{/if}
			<div class="field">
				<label for="add-name">Name</label>
				<input id="add-name" type="text" bind:value={state.addName} required />
			</div>
			<div class="field">
				<label for="add-email">Email address</label>
				<input id="add-email" type="email" bind:value={state.addEmail} required />
			</div>
			<div class="field">
				<label for="add-password">Initial password <span class="hint">(8+ characters)</span></label>
				<input
					id="add-password"
					type="password"
					bind:value={state.addPassword}
					required
					minlength="8"
				/>
			</div>
			<div class="field">
				<label for="add-role">Role</label>
				<select id="add-role" bind:value={state.addRole}>
					<option value="user">User</option>
					<option value="admin">Admin</option>
				</select>
			</div>
			<div class="footer">
				<button
					type="submit"
					class="btn-primary"
					disabled={state.addSubmitting ||
						!state.addName.trim() ||
						!state.addEmail.trim() ||
						state.addPassword.length < 8}
				>
					{state.addSubmitting ? 'Creating...' : 'Create'}
				</button>
			</div>
		</form>
	{/if}

	<ul class="accounts">
		{#each state.accounts as account (account.id)}
			{@const isSelf = account.id === data.user?.userId}
			<li class="card">
				<div class="info">
					<div class="name">
						{account.name}{#if isSelf}<span class="self-tag">(You)</span>{/if}
					</div>
					<div class="email">{account.email}</div>
				</div>
				{#if state.rowError?.id === account.id}
					<p class="row-error">{state.rowError.text}</p>
				{/if}
				<div class="actions">
					<select
						value={account.role}
						disabled={isSelf || state.roleSubmittingId === account.id}
						onchange={(e) =>
							state.changeRole(account.id, e.currentTarget.value as 'admin' | 'user')}
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
					</select>
					<button
						type="button"
						class="delete-btn"
						disabled={isSelf || state.deletingId === account.id}
						onclick={() => state.deleteAccount(account.id)}
						aria-label="Delete"
					>
						<Trash2 size={15} />
					</button>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.page {
		max-width: 680px;
		margin: 0 auto;
		padding: 0 1rem 2rem;

		@media (min-width: 768px) {
			padding: 0 2rem 2rem;
		}
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1.25rem 0 1rem;
		border-bottom: 1px solid var(--color-border);
		margin-bottom: 1rem;

		h1 {
			font-size: 1.125rem;
			font-weight: 700;
		}
	}

	.btn-add {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.4rem 0.9rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: 20px;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
	}

	.add-form {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1.25rem;
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
		select {
			padding: 0.75rem 1rem;
			border: 1px solid var(--color-border);
			border-radius: 8px;
			font-size: 1rem;
			background: var(--color-background);
			color: var(--color-text);
			outline: none;
			width: 100%;
			font-family: inherit;

			&:focus {
				border-color: var(--color-primary);
			}
		}
	}

	.hint {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.footer {
		display: flex;
		justify-content: flex-end;
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

	.error {
		font-size: 0.875rem;
		color: var(--color-error);
		background: var(--color-error-bg);
		padding: 0.625rem 0.875rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.accounts {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.info {
		min-width: 0;
	}

	.name {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.self-tag {
		margin-left: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 400;
		color: var(--color-text-muted);
	}

	.email {
		font-size: 0.8125rem;
		color: var(--color-text-muted);
	}

	.row-error {
		flex-basis: 100%;
		font-size: 0.8125rem;
		color: var(--color-error);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		select {
			padding: 0.4rem 0.6rem;
			border: 1px solid var(--color-border);
			border-radius: 8px;
			font-size: 0.8125rem;
			background: var(--color-background);
			color: var(--color-text);
			font-family: inherit;

			&:disabled {
				opacity: 0.6;
			}
		}
	}

	.delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: none;
		border: none;
		border-radius: 6px;
		color: var(--color-text-muted);
		cursor: pointer;

		&:hover:not(:disabled) {
			background: var(--color-background);
			color: var(--color-error);
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}
</style>
