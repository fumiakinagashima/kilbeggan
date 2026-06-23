import type { PageData } from './$types';

export function createFieldsState(getData: () => PageData) {
	let privacyMap = $state<Record<string, boolean>>({});

	const allActivities = $derived(
		getData().activities.map((a) => ({
			...a,
			isPrivate: a.id in privacyMap ? privacyMap[a.id] : a.isPrivate
		}))
	);

	async function togglePrivacy(activityId: string, current: boolean) {
		const next = !current;
		privacyMap = { ...privacyMap, [activityId]: next };
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

	return {
		get allActivities() {
			return allActivities;
		},
		togglePrivacy
	};
}
