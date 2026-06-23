import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	name: text('name').notNull(),
	role: text('role', { enum: ['admin', 'user'] })
		.notNull()
		.default('user'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const customers = sqliteTable('customers', {
	id: text('id').primaryKey(),
	company: text('company').notNull(),
	phone: text('phone'),
	email: text('email'),
	notes: text('notes'),
	createdBy: text('created_by')
		.notNull()
		.references(() => users.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const activities = sqliteTable('activities', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	body: text('body').notNull(),
	isPrivate: integer('is_private', { mode: 'boolean' }).notNull(),
	attachments: text('attachments'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const activityMentions = sqliteTable('activity_mentions', {
	id: text('id').primaryKey(),
	activityId: text('activity_id')
		.notNull()
		.references(() => activities.id),
	customerId: text('customer_id')
		.notNull()
		.references(() => customers.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type ActivityMention = typeof activityMentions.$inferSelect;
