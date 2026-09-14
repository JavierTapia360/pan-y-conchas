ALTER TABLE `product_inventory` ADD `stock_half_oz` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_inventory` ADD `stock_oz` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_inventory` ADD `stock_qp` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `product_inventory` ADD `stocks_configured` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `product_inventory` ADD `catalog_revision` integer DEFAULT 0 NOT NULL;