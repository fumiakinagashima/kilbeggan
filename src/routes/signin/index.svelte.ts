import { goto } from '$app/navigation';

export function createSignInState() {
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
			const data = (await res.json()) as { error?: string };
			if (!res.ok) {
				error = data.error ?? 'An error occurred';
				return;
			}
			await goto('/');
		} finally {
			loading = false;
		}
	}

	return {
		get email() {
			return email;
		},
		set email(v: string) {
			email = v;
		},
		get password() {
			return password;
		},
		set password(v: string) {
			password = v;
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
