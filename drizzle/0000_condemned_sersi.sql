CREATE TABLE `discounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`discount_rate` real NOT NULL,
	`movie_bundles` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`items` text NOT NULL,
	`subtotal` real NOT NULL,
	`discount_amount` real DEFAULT 0 NOT NULL,
	`total` real NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `prices` (
	`movie_id` integer PRIMARY KEY NOT NULL,
	`price` real NOT NULL
);
