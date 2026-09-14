CREATE INDEX `idx_products_category` ON `products` (`category`);--> statement-breakpoint
CREATE INDEX `idx_products_status` ON `products` (`status`);--> statement-breakpoint
CREATE INDEX `idx_products_featured_sort` ON `products` (`featured`,`sort_order`);--> statement-breakpoint
PRAGMA optimize;
