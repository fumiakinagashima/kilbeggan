import { eq, desc } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { reminders, type Reminder } from '$lib/server/db/schema';
import { getEmailSetupFromEnv, type EmailEnv } from '$lib/server/email';

export type ReminderListRow = {
	id: string;
	remindAt: Date;
	content: string;
	channels: string[];
	channelLabels: string[];
	status: Reminder['status'];
	createdAt: Date;
};

export type ChannelOption = { label: string; value: string };

export function parseChannels(raw: string): string[] {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as string[]) : [];
	} catch {
		return [];
	}
}

export function resolveChannelLabels(channels: string[]): string[] {
	return channels.map((c) => {
		if (c === 'notification') return '通知センター';
		if (c === 'email') return 'メール';
		return c;
	});
}

function toListRow(r: Reminder): ReminderListRow {
	const channels = parseChannels(r.channels);
	return {
		id: r.id,
		remindAt: r.remindAt,
		content: r.content,
		channels,
		channelLabels: resolveChannelLabels(channels),
		status: r.status,
		createdAt: r.createdAt
	};
}

export async function listReminders(db: Db, userId: string): Promise<ReminderListRow[]> {
	const rows = await db
		.select()
		.from(reminders)
		.where(eq(reminders.userId, userId))
		.orderBy(desc(reminders.remindAt))
		.all();
	return rows.map(toListRow);
}

export async function getReminder(db: Db, id: string): Promise<Reminder | null> {
	return (await db.select().from(reminders).where(eq(reminders.id, id)).get()) ?? null;
}

export async function createReminderRow(
	db: Db,
	input: { remindAt: Date; content: string; channels: string[]; userId: string }
): Promise<ReminderListRow> {
	const id = crypto.randomUUID();
	await db.insert(reminders).values({
		id,
		userId: input.userId,
		remindAt: input.remindAt,
		content: input.content,
		channels: JSON.stringify(input.channels),
		status: 'pending',
		createdAt: new Date()
	});
	return toListRow((await getReminder(db, id))!);
}

export async function updateReminder(
	db: Db,
	id: string,
	input: { remindAt: Date; content: string; channels: string[] }
): Promise<ReminderListRow> {
	await db
		.update(reminders)
		.set({
			remindAt: input.remindAt,
			content: input.content,
			channels: JSON.stringify(input.channels)
		})
		.where(eq(reminders.id, id));
	return toListRow((await getReminder(db, id))!);
}

export async function deleteReminder(db: Db, id: string): Promise<void> {
	await db.delete(reminders).where(eq(reminders.id, id));
}

export function getReminderChannelOptions(env?: EmailEnv): ChannelOption[] {
	const options: ChannelOption[] = [{ label: '通知センター', value: 'notification' }];
	if (getEmailSetupFromEnv(env ?? {})) options.push({ label: 'メール', value: 'email' });
	return options;
}
