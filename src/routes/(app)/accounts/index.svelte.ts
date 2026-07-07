import type { PageData } from './$types';

type Account = PageData['accounts'][number];
type Role = 'admin' | 'user';

export function createAccountsState(getData: () => PageData) {
	let accounts = $state(getData().accounts);
	let showAddForm = $state(false);
	let addName = $state('');
	let addEmail = $state('');
	let addPassword = $state('');
	let addRole = $state<Role>('user');
	let addSubmitting = $state(false);
	let addError = $state('');
	let roleSubmittingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);
	let rowError = $state<{ id: string; text: string } | null>(null);

	function resetAddForm() {
		addName = '';
		addEmail = '';
		addPassword = '';
		addRole = 'user';
		addError = '';
	}

	function toggleAddForm() {
		showAddForm = !showAddForm;
		if (!showAddForm) resetAddForm();
	}

	async function createAccount(e: SubmitEvent) {
		e.preventDefault();
		addSubmitting = true;
		addError = '';
		try {
			const res = await fetch('/api/accounts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: addName,
					email: addEmail,
					password: addPassword,
					role: addRole
				})
			});
			const result = (await res.json()) as { account?: Account; error?: string };
			if (!res.ok || !result.account) {
				addError = result.error ?? 'エラーが発生しました';
				return;
			}
			accounts = [...accounts, result.account];
			showAddForm = false;
			resetAddForm();
		} finally {
			addSubmitting = false;
		}
	}

	async function changeRole(id: string, role: Role) {
		const previous = accounts;
		roleSubmittingId = id;
		rowError = null;
		accounts = accounts.map((a) => (a.id === id ? { ...a, role } : a));
		try {
			const res = await fetch(`/api/accounts/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role })
			});
			if (!res.ok) {
				const result = (await res.json()) as { error?: string };
				accounts = previous;
				rowError = { id, text: result.error ?? 'エラーが発生しました' };
			}
		} finally {
			roleSubmittingId = null;
		}
	}

	async function deleteAccount(id: string) {
		if (!confirm('このアカウントを削除しますか？')) return;
		deletingId = id;
		rowError = null;
		try {
			const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const result = (await res.json()) as { error?: string };
				rowError = { id, text: result.error ?? 'エラーが発生しました' };
				return;
			}
			accounts = accounts.filter((a) => a.id !== id);
		} finally {
			deletingId = null;
		}
	}

	return {
		get accounts() {
			return accounts;
		},
		get showAddForm() {
			return showAddForm;
		},
		toggleAddForm,
		get addName() {
			return addName;
		},
		set addName(v: string) {
			addName = v;
		},
		get addEmail() {
			return addEmail;
		},
		set addEmail(v: string) {
			addEmail = v;
		},
		get addPassword() {
			return addPassword;
		},
		set addPassword(v: string) {
			addPassword = v;
		},
		get addRole() {
			return addRole;
		},
		set addRole(v: Role) {
			addRole = v;
		},
		get addSubmitting() {
			return addSubmitting;
		},
		get addError() {
			return addError;
		},
		createAccount,
		get roleSubmittingId() {
			return roleSubmittingId;
		},
		changeRole,
		get deletingId() {
			return deletingId;
		},
		get rowError() {
			return rowError;
		},
		deleteAccount
	};
}
