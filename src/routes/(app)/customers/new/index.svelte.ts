import { goto } from '$app/navigation';

export function createCustomerNewState() {
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
				error = data.error ?? 'An error occurred';
				return;
			}
			goto(`/customers/${data.id}`);
		} finally {
			loading = false;
		}
	}

	return {
		get company() {
			return company;
		},
		set company(v: string) {
			company = v;
		},
		get phone() {
			return phone;
		},
		set phone(v: string) {
			phone = v;
		},
		get email() {
			return email;
		},
		set email(v: string) {
			email = v;
		},
		get notes() {
			return notes;
		},
		set notes(v: string) {
			notes = v;
		},
		get error() {
			return error;
		},
		get loading() {
			return loading;
		},
		submit
	};
}
