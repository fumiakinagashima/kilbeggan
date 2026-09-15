import { goto } from '$app/navigation';
import {
	isPushSupported,
	getPushSubscription,
	subscribeToPush,
	unsubscribeFromPush
} from '$lib/push';
import type { PageData } from './$types';

export function createSettingsState(getData: () => PageData) {
	const user = getData().user!;

	// push notifications
	let pushSupported = $state(false);
	let pushSubscribed = $state(false);
	let pushSubmitting = $state(false);
	let pushMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	$effect(() => {
		pushSupported = isPushSupported();
		if (pushSupported) {
			getPushSubscription().then((sub) => {
				pushSubscribed = !!sub;
			});
		}
	});

	async function togglePush() {
		const vapidPublicKey = getData().vapidPublicKey;
		if (!vapidPublicKey) {
			pushMessage = { type: 'error', text: 'Push notifications are not configured' };
			return;
		}
		pushSubmitting = true;
		pushMessage = null;
		try {
			if (pushSubscribed) {
				await unsubscribeFromPush();
				pushSubscribed = false;
				pushMessage = { type: 'success', text: 'Push notifications disabled' };
			} else {
				if (Notification.permission === 'denied') {
					pushMessage = {
						type: 'error',
						text: 'Browser notifications are blocked. Please allow them in your browser settings'
					};
					return;
				}
				await subscribeToPush(vapidPublicKey);
				pushSubscribed = true;
				pushMessage = { type: 'success', text: 'Push notifications enabled' };
			}
		} catch {
			pushMessage = { type: 'error', text: 'An error occurred' };
		} finally {
			pushSubmitting = false;
		}
	}

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

	// org settings (admin only)
	let followUpDays = $state(getData().followUpDays);
	let followUpSubmitting = $state(false);
	let followUpMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	async function saveProfile() {
		profileSubmitting = true;
		profileMessage = null;
		try {
			const res = await fetch('/api/account/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: profileName, email: profileEmail })
			});
			const data = (await res.json()) as { ok?: boolean; error?: string };
			if (res.ok) {
				profileMessage = { type: 'success', text: 'Profile saved' };
			} else {
				profileMessage = { type: 'error', text: data.error ?? 'An error occurred' };
			}
		} catch {
			profileMessage = { type: 'error', text: 'An error occurred' };
		} finally {
			profileSubmitting = false;
		}
	}

	async function savePassword() {
		if (newPassword !== confirmPassword) {
			passwordMessage = { type: 'error', text: 'New passwords do not match' };
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
			const data = (await res.json()) as { ok?: boolean; error?: string };
			if (res.ok) {
				passwordMessage = { type: 'success', text: 'Password changed' };
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				passwordMessage = { type: 'error', text: data.error ?? 'An error occurred' };
			}
		} catch {
			passwordMessage = { type: 'error', text: 'An error occurred' };
		} finally {
			passwordSubmitting = false;
		}
	}

	async function saveFollowUpDays() {
		if (!followUpDays || followUpDays < 1) {
			followUpMessage = { type: 'error', text: 'Please enter a number of 1 or greater' };
			return;
		}
		followUpSubmitting = true;
		followUpMessage = null;
		try {
			const res = await fetch('/api/settings/org', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ key: 'follow_up_days', value: String(followUpDays) })
			});
			const data = (await res.json()) as { ok?: boolean; error?: string };
			if (res.ok) {
				followUpMessage = { type: 'success', text: 'Saved' };
			} else {
				followUpMessage = { type: 'error', text: data.error ?? 'An error occurred' };
			}
		} catch {
			followUpMessage = { type: 'error', text: 'An error occurred' };
		} finally {
			followUpSubmitting = false;
		}
	}

	async function signout() {
		await fetch('/api/auth/signout', { method: 'POST' });
		goto('/signin');
	}

	return {
		get isAdmin() {
			return user.role === 'admin';
		},

		get pushSupported() {
			return pushSupported;
		},
		get pushSubscribed() {
			return pushSubscribed;
		},
		get pushSubmitting() {
			return pushSubmitting;
		},
		get pushMessage() {
			return pushMessage;
		},
		togglePush,

		get profileName() {
			return profileName;
		},
		set profileName(v: string) {
			profileName = v;
		},
		get profileEmail() {
			return profileEmail;
		},
		set profileEmail(v: string) {
			profileEmail = v;
		},
		get profileSubmitting() {
			return profileSubmitting;
		},
		get profileMessage() {
			return profileMessage;
		},

		get currentPassword() {
			return currentPassword;
		},
		set currentPassword(v: string) {
			currentPassword = v;
		},
		get newPassword() {
			return newPassword;
		},
		set newPassword(v: string) {
			newPassword = v;
		},
		get confirmPassword() {
			return confirmPassword;
		},
		set confirmPassword(v: string) {
			confirmPassword = v;
		},
		get passwordSubmitting() {
			return passwordSubmitting;
		},
		get passwordMessage() {
			return passwordMessage;
		},

		get followUpDays() {
			return followUpDays;
		},
		set followUpDays(v: number) {
			followUpDays = v;
		},
		get followUpSubmitting() {
			return followUpSubmitting;
		},
		get followUpMessage() {
			return followUpMessage;
		},

		saveProfile,
		savePassword,
		saveFollowUpDays,
		signout
	};
}
