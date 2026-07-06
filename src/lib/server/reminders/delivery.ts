import { and, eq, lte } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { reminders, type Reminder } from '$lib/server/db/schema';
import { parseChannels } from '$lib/services/reminder';
import { createNotification } from '$lib/services/notification';
import { getAccountById } from '$lib/services/account';
import { getEmailSetupFromEnv, sendEmail, type EmailEnv } from '$lib/server/email';

export type ReminderDeliveryResult = {
	id: string;
	status: 'sent' | 'failed';
	errors: string[];
};

export async function getDueReminders(db: Db, now: Date = new Date()): Promise<Reminder[]> {
	return db
		.select()
		.from(reminders)
		.where(and(eq(reminders.status, 'pending'), lte(reminders.remindAt, now)))
		.all();
}

async function deliverToChannel(
	db: Db,
	channel: string,
	reminder: Reminder,
	env?: EmailEnv
): Promise<void> {
	if (channel === 'notification') {
		await createNotification(db, {
			title: 'リマインダー',
			body: reminder.content,
			userId: reminder.userId
		});
		return;
	}

	if (channel === 'email') {
		const setup = getEmailSetupFromEnv(env ?? {});
		if (!setup) throw new Error('メール送信が設定されていません（EMAIL_PROVIDER等の環境変数を確認してください）');
		const account = await getAccountById(db, reminder.userId);
		if (!account) throw new Error('アカウントが見つかりません');
		await sendEmail(setup.providerConfig, {
			from: setup.from,
			fromName: setup.fromName,
			to: account.email,
			subject: 'リマインダー',
			text: reminder.content
		});
		return;
	}

	throw new Error(`未対応の通知先です: ${channel}`);
}

export async function deliverReminder(
	db: Db,
	reminder: Reminder,
	env?: EmailEnv
): Promise<ReminderDeliveryResult> {
	const channels = parseChannels(reminder.channels);
	const deliveryErrors: string[] = [];
	for (const channel of channels) {
		try {
			await deliverToChannel(db, channel, reminder, env);
		} catch (e) {
			deliveryErrors.push(`${channel}: ${e instanceof Error ? e.message : String(e)}`);
		}
	}

	const status = deliveryErrors.length === 0 ? 'sent' : 'failed';
	await db.update(reminders).set({ status }).where(eq(reminders.id, reminder.id));
	return { id: reminder.id, status, errors: deliveryErrors };
}

export async function processDueReminders(
	db: Db,
	env?: EmailEnv,
	now: Date = new Date()
): Promise<ReminderDeliveryResult[]> {
	const due = await getDueReminders(db, now);
	const results: ReminderDeliveryResult[] = [];
	for (const reminder of due) {
		results.push(await deliverReminder(db, reminder, env));
	}
	return results;
}
