CREATE INDEX `idx_contact_messages_created_at` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_contact_messages_status` ON `contact_messages` (`status`);--> statement-breakpoint
CREATE INDEX `idx_orders_created_at` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_status` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_product_media_product_sort` ON `product_media` (`product_id`,`sort_order`);