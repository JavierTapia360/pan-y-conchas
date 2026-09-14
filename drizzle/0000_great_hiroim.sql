CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`state` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`language` text NOT NULL,
	`status` text DEFAULT 'NEW' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `merch_products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description_es` text NOT NULL,
	`description_en` text NOT NULL,
	`price_cents` integer NOT NULL,
	`inventory` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`images_json` text DEFAULT '[]' NOT NULL,
	`variants_json` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `merch_products_slug_unique` ON `merch_products` (`slug`);--> statement-breakpoint
CREATE TABLE `newsletter` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`language` text NOT NULL,
	`status` text DEFAULT 'SUBSCRIBED' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_email_unique` ON `newsletter` (`email`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_email` text NOT NULL,
	`status` text NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`shipping_cents` integer NOT NULL,
	`tax_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	`payment_status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_media` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'AVAILABLE' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`accent` text NOT NULL,
	`description_es` text NOT NULL,
	`description_en` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_es` text NOT NULL,
	`value_en` text NOT NULL,
	`status` text DEFAULT 'PUBLISHED' NOT NULL,
	`updated_at` text NOT NULL
);
