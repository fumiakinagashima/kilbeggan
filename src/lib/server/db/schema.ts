import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
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
	aiSummary: text('ai_summary'),
	aiSummaryUpdatedAt: integer('ai_summary_updated_at', { mode: 'timestamp' }),
	summaryEditedAt: integer('summary_edited_at', { mode: 'timestamp' }),
	summaryEditedBy: text('summary_edited_by'),
	managerComment: text('manager_comment'),
	managerCommentEditedAt: integer('manager_comment_edited_at', { mode: 'timestamp' }),
	managerCommentEditedBy: text('manager_comment_edited_by'),
	score: integer('score'),
	scoreUpdatedAt: integer('score_updated_at', { mode: 'timestamp' }),
	createdBy: text('created_by')
		.notNull()
		.references(() => accounts.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const activities = sqliteTable('activities', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => accounts.id),
	body: text('body').notNull(),
	isPrivate: integer('is_private', { mode: 'boolean' }).notNull(),
	attachments: text('attachments'),
	tags: text('tags'),
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

export const orgSettings = sqliteTable('org_settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	updatedBy: text('updated_by').references(() => accounts.id)
});

export type User = typeof accounts.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type ActivityMention = typeof activityMentions.$inferSelect;
export type OrgSetting = typeof orgSettings.$inferSelect;
