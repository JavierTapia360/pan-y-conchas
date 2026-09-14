CREATE TABLE `product_inventory` (
	`product_id` text PRIMARY KEY NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`available` integer DEFAULT false NOT NULL,
	`price_cents` integer,
	`updated_at` text NOT NULL
);
