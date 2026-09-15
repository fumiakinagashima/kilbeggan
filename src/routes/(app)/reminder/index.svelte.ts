import { nowJstDatetimeLocal, toJstDatetimeLocal } from '$lib/datetime';
import type { ReminderListRow } from '$lib/services/reminder';
import type { ReminderDeliveryResult } from '$lib/server/reminders/delivery';
import type { PageData } from './$types';

export function createReminderPageState(getData: () => PageData) {
	let rows = $state<ReminderListRow[]>(getData().rows);

	let editingId = $state<string | null>(null);
	let remindAt = $state(nowJstDatetimeLocal());
	let content = $state('');
	let selectedChannels = $state<string[]>(['notification']);
	let submitting = $state(false);
	let error = $state('');

	let running = $state(false);
	let runMessage = $state('');

	function sortRows() {
		rows = [...rows].sort((a, b) => b.remindAt.getTime() - a.remindAt.getTime());
	}

	function resetForm() {
		editingId = null;
		remindAt = nowJstDatetimeLocal();
		content = '';
		selectedChannels = ['notification'];
		error = '';
	}

	function startEdit(row: ReminderListRow) {
		editingId = row.id;
		remindAt = toJstDatetimeLocal(row.remindAt);
		content = row.content;
		selectedChannels = row.channels;
		error = '';
	}

	function toggleChannel(value: string) {
		selectedChannels = selectedChannels.includes(value)
			? selectedChannels.filter((c) => c !== value)
			: [...selectedChannels, value];
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (selectedChannels.length === 0) {
			error = 'Please select at least one notification channel';
			return;
		}
		submitting = true;
		error = '';
		try {
			const body = JSON.stringify({
				remind_at: remindAt,
				content,
				channels: selectedChannels.join(',')
			});
			const res = editingId
				? await fetch(`/api/reminders/${editingId}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body
					})
				: await fetch('/api/reminders', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body
					});
			const data = (await res.json()) as ReminderListRow & { error?: string };
			if (!res.ok) {
				error = data.error ?? 'An error occurred';
				return;
			}
			const row = {
				...data,
				remindAt: new Date(data.remindAt),
				createdAt: new Date(data.createdAt)
			};
			rows = editingId ? rows.map((r) => (r.id === row.id ? row : r)) : [row, ...rows];
			sortRows();
			resetForm();
		} finally {
			submitting = false;
		}
	}

	async function deleteRow(id: string) {
		if (!confirm('Delete this reminder?')) return;
		await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
		rows = rows.filter((r) => r.id !== id);
		if (editingId === id) resetForm();
	}

	async function runDelivery() {
		if (running) return;
		running = true;
		runMessage = '';
		try {
			const res = await fetch('/api/reminders/run', { method: 'POST' });
			if (!res.ok) {
				runMessage = 'Delivery failed to run';
				return;
			}
			const { results } = (await res.json()) as { results: ReminderDeliveryResult[] };
			if (results.length === 0) {
				runMessage = 'No reminders were due for delivery';
			} else {
				const sent = results.filter((r) => r.status === 'sent').length;
				const failed = results.filter((r) => r.status === 'failed').length;
				runMessage = `Sent: ${sent}${failed > 0 ? ` / Failed: ${failed}` : ''}`;
				const statusById = new Map(results.map((r) => [r.id, r.status]));
				rows = rows.map((row) =>
					statusById.has(row.id) ? { ...row, status: statusById.get(row.id)! } : row
				);
			}
		} finally {
			running = false;
		}
	}

	return {
		get rows() {
			return rows;
		},
		get channelOptions() {
			return getData().channelOptions;
		},
		get editingId() {
			return editingId;
		},
		get remindAt() {
			return remindAt;
		},
		set remindAt(v: string) {
			remindAt = v;
		},
		get content() {
			return content;
		},
		set content(v: string) {
			content = v;
		},
		get selectedChannels() {
			return selectedChannels;
		},
		get submitting() {
			return submitting;
		},
		get error() {
			return error;
		},
		get running() {
			return running;
		},
		get runMessage() {
			return runMessage;
		},
		toggleChannel,
		startEdit,
		cancelEdit: resetForm,
		submit,
		deleteRow,
		runDelivery
	};
}
