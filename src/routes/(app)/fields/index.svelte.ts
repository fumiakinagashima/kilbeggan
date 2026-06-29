import type { PageData } from './$types';
import { ACTIVITIES_PAGE_SIZE } from '$lib/constants';

type ActivityItem = {
	id: string;
	body: string;
	isPrivate: boolean;
	attachments: { key: string; name: string }[];
	tags: string[];
	createdAt: Date | string;
	userId: string;
	userName: string | null;
	mentions: { customerId: string; company: string }[];
};

type FetchResult = { activities: ActivityItem[]; hasMore: boolean };

export function createFieldsState(getData: () => PageData) {
	let extraPages = $state<ActivityItem[][]>([]);
	let loading = $state(false);
	let hasMore = $state(getData().activities.length === ACTIVITIES_PAGE_SIZE);
	let privacyMap = $state<Record<string, boolean>>({});
	let deletedIds = $state<Set<string>>(new Set());
	let openMenuId = $state<string | null>(null);

	const allActivities = $derived(
		[...(getData().activities as ActivityItem[]), ...extraPages.flat()]
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

	async function loadMore() {
		if (loading || !hasMore) return;

		const allRaw = [...(getData().activities as ActivityItem[]), ...extraPages.flat()];
		const last = allRaw[allRaw.length - 1];
		if (!last) return;

		const cursor = (last.createdAt instanceof Date
			? last.createdAt
			: new Date(last.createdAt)
		).getTime();

		loading = true;
		try {
			const res = await fetch(`/api/activities?cursor=${cursor}`);
			if (!res.ok) return;
			const data = (await res.json()) as FetchResult;
			if (data.activities.length > 0) {
				extraPages = [...extraPages, data.activities];
			}
			hasMore = data.hasMore;
		} finally {
			loading = false;
		}
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
		get loading() { return loading; },
		get hasMore() { return hasMore; },
		openMenu,
		closeMenu,
		loadMore,
		togglePrivacy,
		deleteActivity
	};
}
