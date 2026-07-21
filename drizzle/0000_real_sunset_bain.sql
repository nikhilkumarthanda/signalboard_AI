CREATE TABLE `alert_states` (
	`alert_id` integer NOT NULL,
	`owner_email` text NOT NULL,
	`status` text NOT NULL,
	`assignee` text,
	`note` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `imports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`file_name` text NOT NULL,
	`row_count` integer NOT NULL,
	`valid_rows` integer NOT NULL,
	`total_mrr` real NOT NULL,
	`imported_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scenarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`churn` real NOT NULL,
	`hires` integer NOT NULL,
	`arr` real NOT NULL,
	`margin` real NOT NULL,
	`runway` real NOT NULL,
	`created_at` text NOT NULL
);
