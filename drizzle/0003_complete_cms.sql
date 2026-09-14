ALTER TABLE `product_media` ADD `alt_es` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `product_media` ADD `alt_en` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `product_media` ADD `focal_x` integer DEFAULT 50 NOT NULL;
--> statement-breakpoint
ALTER TABLE `product_media` ADD `focal_y` integer DEFAULT 50 NOT NULL;
--> statement-breakpoint
ALTER TABLE `newsletter` ADD `updated_at` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `items_json` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_address_json` text DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_method` text;
--> statement-breakpoint
ALTER TABLE `orders` ADD `tracking_number` text;
--> statement-breakpoint
CREATE TABLE `analytics_events` (
  `id` text PRIMARY KEY NOT NULL,
  `event` text NOT NULL,
  `path` text NOT NULL,
  `slug` text,
  `language` text,
  `device_type` text,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_analytics_events_event_created` ON `analytics_events` (`event`,`created_at`);
--> statement-breakpoint
CREATE TABLE `admin_audit` (
  `id` text PRIMARY KEY NOT NULL,
  `actor_email` text NOT NULL,
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_audit_created` ON `admin_audit` (`created_at`);
