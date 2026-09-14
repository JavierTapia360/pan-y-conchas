import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    status: text('status', { enum: ['AVAILABLE', 'SOLD_OUT', 'HIDDEN'] })
      .notNull()
      .default('AVAILABLE'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    accent: text('accent').notNull(),
    descriptionEs: text('description_es').notNull(),
    descriptionEn: text('description_en').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_products_category').on(table.category),
    index('idx_products_status').on(table.status),
    index('idx_products_featured_sort').on(table.featured, table.sortOrder),
  ],
);
export const productInventory = sqliteTable('product_inventory', {
  productId: text('product_id').primaryKey(),
  stock: integer('stock').notNull().default(0),
  available: integer('available', { mode: 'boolean' }).notNull().default(false),
  priceCents: integer('price_cents'),
  priceHalfOzCents: integer('price_half_oz_cents'),
  priceOzCents: integer('price_oz_cents'),
  priceQpCents: integer('price_qp_cents'),
  pricesConfigured: integer('prices_configured', { mode: 'boolean' })
    .notNull()
    .default(false),
  stockHalfOz: integer('stock_half_oz').notNull().default(0),
  stockOz: integer('stock_oz').notNull().default(0),
  stockQp: integer('stock_qp').notNull().default(0),
  stocksConfigured: integer('stocks_configured', { mode: 'boolean' })
    .notNull()
    .default(false),
  catalogRevision: integer('catalog_revision').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
});
export const productMedia = sqliteTable(
  'product_media',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    type: text('type', {
      enum: ['HERO', 'GALLERY', 'MOBILE', 'VIDEO'],
    }).notNull(),
    url: text('url').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    altEs: text('alt_es').notNull().default(''),
    altEn: text('alt_en').notNull().default(''),
    focalX: integer('focal_x').notNull().default(50),
    focalY: integer('focal_y').notNull().default(50),
  },
  (table) => [
    index('idx_product_media_product_sort').on(
      table.productId,
      table.sortOrder,
    ),
  ],
);
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  valueEs: text('value_es').notNull(),
  valueEn: text('value_en').notNull(),
  status: text('status', { enum: ['DRAFT', 'PUBLISHED'] })
    .notNull()
    .default('PUBLISHED'),
  updatedAt: text('updated_at').notNull(),
});
export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    state: text('state').notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),
    language: text('language').notNull(),
    status: text('status', { enum: ['NEW', 'READ', 'ARCHIVED'] })
      .notNull()
      .default('NEW'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_contact_messages_created_at').on(table.createdAt),
    index('idx_contact_messages_status').on(table.status),
  ],
);
export const newsletter = sqliteTable('newsletter', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  language: text('language').notNull(),
  status: text('status', { enum: ['SUBSCRIBED', 'UNSUBSCRIBED'] })
    .notNull()
    .default('SUBSCRIBED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});
export const merchProducts = sqliteTable('merch_products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  descriptionEs: text('description_es').notNull(),
  descriptionEn: text('description_en').notNull(),
  priceCents: integer('price_cents').notNull(),
  inventory: integer('inventory').notNull().default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(false),
  imagesJson: text('images_json').notNull().default('[]'),
  variantsJson: text('variants_json').notNull().default('[]'),
  updatedAt: text('updated_at').notNull(),
});
export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    customerEmail: text('customer_email').notNull(),
    status: text('status').notNull(),
    subtotalCents: integer('subtotal_cents').notNull(),
    shippingCents: integer('shipping_cents').notNull(),
    taxCents: integer('tax_cents').notNull(),
    totalCents: integer('total_cents').notNull(),
    paymentStatus: text('payment_status').notNull(),
    itemsJson: text('items_json').notNull().default('[]'),
    shippingAddressJson: text('shipping_address_json').notNull().default('{}'),
    shippingMethod: text('shipping_method'),
    trackingNumber: text('tracking_number'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_orders_created_at').on(table.createdAt),
    index('idx_orders_status').on(table.status),
  ],
);

export const analyticsEvents = sqliteTable(
  'analytics_events',
  {
    id: text('id').primaryKey(),
    event: text('event').notNull(),
    path: text('path').notNull(),
    slug: text('slug'),
    language: text('language'),
    deviceType: text('device_type'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_analytics_events_event_created').on(
      table.event,
      table.createdAt,
    ),
  ],
);

export const adminAudit = sqliteTable(
  'admin_audit',
  {
    id: text('id').primaryKey(),
    actorEmail: text('actor_email').notNull(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('idx_admin_audit_created').on(table.createdAt)],
);
