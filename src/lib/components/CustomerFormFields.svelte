<script lang="ts">
	interface Props {
		company: string;
		phone: string;
		email: string;
		notes: string;
		disabled?: boolean;
	}

	let {
		company = $bindable(),
		phone = $bindable(),
		email = $bindable(),
		notes = $bindable(),
		disabled = false
	}: Props = $props();
</script>

<div class="field">
	<label for="company">Company Name <span class="required">*</span></label>
	<input id="company" name="company" type="text" bind:value={company} required {disabled} />
</div>

<div class="field">
	<label for="phone">Phone Number</label>
	<input id="phone" name="phone" type="tel" bind:value={phone} {disabled} />
</div>

<div class="field">
	<label for="email">Email</label>
	<input id="email" name="email" type="email" bind:value={email} {disabled} />
</div>

<div class="field">
	<label for="notes">Notes</label>
	<textarea id="notes" name="notes" rows="6" bind:value={notes} {disabled}></textarea>
</div>

<style lang="scss">
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
</style>
