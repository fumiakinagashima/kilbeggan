import { and, eq, lte } from 'drizzle-orm';
import type { Db } from '$lib/server/db';
import { reminders, type Reminder } from '$lib/server/db/schema';
import { parseChannels } from '$lib/services/reminder';
import { createNotification } from '$lib/services/notification';
import { getAccountById } from '$lib/services/account';
import { listPushSubscriptions, deletePushSubscription } from '$lib/services/push-subscription';
import { getEmailSetupFromEnv, sendEmail, type EmailEnv } from '$lib/server/email';
import {
	sendPushNotification,
	PushSubscriptionExpiredError,
	type PushEnv
} from '$lib/server/push/send';

type DeliveryEnv = EmailEnv & PushEnv;

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
	env?: DeliveryEnv
): Promise<void> {
	if (channel === 'notification') {
		await createNotification(db, {
			title: 'Reminder',
			body: reminder.content,
			userId: reminder.userId
		});
		return;
	}

	if (channel === 'email') {
		const setup = getEmailSetupFromEnv(env ?? {});
		if (!setup)
			throw new Error(
				'Email sending is not configured (check EMAIL_PROVIDER and other environment variables)'
			);
		const account = await getAccountById(db, reminder.userId);
		if (!account) throw new Error('Account not found');
		await sendEmail(setup.providerConfig, {
			from: setup.from,
			fromName: setup.fromName,
			to: account.email,
			subject: 'Reminder',
			text: reminder.content
		});
		return;
	}

	if (channel === 'push') {
		const subscriptions = await listPushSubscriptions(db, reminder.userId);
		for (const subscription of subscriptions) {
			try {
				await sendPushNotification(
					subscription,
					{ title: 'Reminder', body: reminder.content, url: '/reminder' },
					env ?? {}
				);
			} catch (e) {
				if (e instanceof PushSubscriptionExpiredError) {
					await deletePushSubscription(db, subscription.endpoint);
					continue;
				}
				throw e;
			}
		}
		return;
	}

	throw new Error(`Unsupported notification channel: ${channel}`);
}

export async function deliverReminder(
	db: Db,
	reminder: Reminder,
	env?: DeliveryEnv
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
	env?: DeliveryEnv,
	now: Date = new Date()
): Promise<ReminderDeliveryResult[]> {
	const due = await getDueReminders(db, now);
	const results: ReminderDeliveryResult[] = [];
	for (const reminder of due) {
		results.push(await deliverReminder(db, reminder, env));
	}
	return results;
}
