ALTER TABLE `users` RENAME TO `accounts`;
--> statement-breakpoint
DROP INDEX IF EXISTS `users_email_unique`;
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);
