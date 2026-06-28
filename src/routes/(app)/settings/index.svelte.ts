import type { LayoutData } from '../$types';

export function createSettingsState(getLayoutData: () => LayoutData) {
	const user = getLayoutData().user!;

	// profile
	let profileName = $state(user.name);
	let profileEmail = $state(user.email);
	let profileSubmitting = $state(false);
	let profileMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	// password
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordSubmitting = $state(false);
	let passwordMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	async function saveProfile() {
		profileSubmitting = true;
		profileMessage = null;
		try {
			const res = await fetch('/api/account/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: profileName, email: profileEmail })
			});
			const data = await res.json() as { ok?: boolean; error?: string };
			if (res.ok) {
				profileMessage = { type: 'success', text: 'プロフィールを保存しました' };
			} else {
				profileMessage = { type: 'error', text: data.error ?? 'エラーが発生しました' };
			}
		} catch {
			profileMessage = { type: 'error', text: 'エラーが発生しました' };
		} finally {
			profileSubmitting = false;
		}
	}

	async function savePassword() {
		if (newPassword !== confirmPassword) {
			passwordMessage = { type: 'error', text: '新しいパスワードが一致しません' };
			return;
		}
		passwordSubmitting = true;
		passwordMessage = null;
		try {
			const res = await fetch('/api/account/password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
			});
			const data = await res.json() as { ok?: boolean; error?: string };
			if (res.ok) {
				passwordMessage = { type: 'success', text: 'パスワードを変更しました' };
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				passwordMessage = { type: 'error', text: data.error ?? 'エラーが発生しました' };
			}
		} catch {
			passwordMessage = { type: 'error', text: 'エラーが発生しました' };
		} finally {
			passwordSubmitting = false;
		}
	}

	return {
		get profileName() { return profileName; },
		set profileName(v: string) { profileName = v; },
		get profileEmail() { return profileEmail; },
		set profileEmail(v: string) { profileEmail = v; },
		get profileSubmitting() { return profileSubmitting; },
		get profileMessage() { return profileMessage; },

		get currentPassword() { return currentPassword; },
		set currentPassword(v: string) { currentPassword = v; },
		get newPassword() { return newPassword; },
		set newPassword(v: string) { newPassword = v; },
		get confirmPassword() { return confirmPassword; },
		set confirmPassword(v: string) { confirmPassword = v; },
		get passwordSubmitting() { return passwordSubmitting; },
		get passwordMessage() { return passwordMessage; },

		saveProfile,
		savePassword
	};
}
