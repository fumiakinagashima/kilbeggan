import { getDb } from '$lib/server/db';
import { listActivities } from '$lib/server/db/activity-service';
import { listCustomersWithLastActivity } from '$lib/server/db/customer-service';

export async function load({ platform }) {
	const db = getDb(platform!.env.DB);
	const [allActivities, customers] = await Promise.all([
		listActivities(db, 100),
		listCustomersWithLastActivity(db)
	]);

	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const alertCustomers = customers.filter(
		(c) => !c.lastActivityAt || c.lastActivityAt < thirtyDaysAgo
	);
	const recentActivities = allActivities.filter((a) => new Date(a.createdAt) >= sevenDaysAgo);

	let teamSummary = '';
	let summaryUpdatedAt = '';
	try {
		const cached = await platform!.env.KV.get('dashboard:team_summary');
		if (cached) {
			const parsed = JSON.parse(cached) as { summary: string; updatedAt: string };
			teamSummary = parsed.summary;
			summaryUpdatedAt = parsed.updatedAt;
		}
	} catch {}

	return {
		teamSummary,
		summaryUpdatedAt,
		alertCustomers,
		stats: {
			total7days: recentActivities.length,
			uniqueCustomers7days: new Set(
				recentActivities.flatMap((a) => a.mentions.map((m) => m.customerId))
			).size,
			totalCustomers: customers.length,
			alertCount: alertCustomers.length
		}
	};
}
