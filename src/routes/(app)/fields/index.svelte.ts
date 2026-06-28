import type { PageData } from './$types';

export function createFieldsState(getData: () => PageData) {
	let privacyMap = $state<Record<string, boolean>>({});
	let deletedIds = $state<Set<string>>(new Set());
	let openMenuId = $state<string | null>(null);

	const allActivities = $derived(
		getData().activities
			.filter((a) => !deletedIds.has(a.id))
			.map((a) => ({
				...a,
				isPrivate: a.id in privacyMap ? privacyMap[a.id] : a.isPrivate
			}))
	);

	function openMenu(id: string) {
		openMenuId = openMenuId === id ? null : id;
	}

	function closeMenu() {
		openMenuId = null;
	}

	async function togglePrivacy(activityId: string, current: boolean) {
		const next = !current;
		privacyMap = { ...privacyMap, [activityId]: next };
		openMenuId = null;
		const res = await fetch(`/api/activities/${activityId}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isPrivate: next })
		});
		if (!res.ok) {
			const copy = { ...privacyMap };
			delete copy[activityId];
			privacyMap = copy;
		}
	}

	async function deleteActivity(activityId: string) {
		openMenuId = null;
		deletedIds = new Set([...deletedIds, activityId]);
		const res = await fetch(`/api/activities/${activityId}`, { method: 'DELETE' });
		if (!res.ok) {
			const next = new Set(deletedIds);
			next.delete(activityId);
			deletedIds = next;
		}
	}

	return {
		get allActivities() { return allActivities; },
		get openMenuId() { return openMenuId; },
		openMenu,
		closeMenu,
		togglePrivacy,
		deleteActivity
	};
}
