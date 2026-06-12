ALTER TABLE `items` ADD `entered_today` text;--> statement-breakpoint
ALTER TABLE `items` ADD `completed_at` text;--> statement-breakpoint
UPDATE `items` SET `status` = 'today' WHERE `status` IN ('todo', 'in_progress', 'blocked');--> statement-breakpoint
UPDATE `items` SET `entered_today` = date('now', 'localtime') WHERE `status` = 'today' AND `entered_today` IS NULL;--> statement-breakpoint
UPDATE `items` SET `completed_at` = `updated_at` WHERE `status` = 'done' AND `completed_at` IS NULL;