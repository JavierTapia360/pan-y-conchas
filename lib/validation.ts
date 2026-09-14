import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  state: z.string().trim().min(2).max(100),
  subject: z.string().trim().min(2).max(140),
  message: z.string().trim().min(10).max(5000),
  language: z.enum(['es', 'en']),
  company_website: z.string().max(0).optional(),
});
export const newsletterSchema = z.object({
  email: z.email().max(254),
  language: z.enum(['es', 'en']),
  consent: z.literal(true),
});
const nullablePriceSchema = z.number().int().min(0).max(10_000_000).nullable();
const stockSchema = z.number().int().min(0).max(100_000);
export const productPricesSchema = z.object({
  halfOz: nullablePriceSchema,
  oz: nullablePriceSchema,
  qp: nullablePriceSchema,
});
export const productStocksSchema = z.object({
  halfOz: stockSchema,
  oz: stockSchema,
  qp: stockSchema,
});

export const adminProductSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(100),
  status: z.enum(['AVAILABLE', 'SOLD_OUT', 'HIDDEN']),
  featured: z.boolean(),
  active: z.boolean(),
  sortOrder: z.number().int().min(0).max(999),
  accent: z.enum(['candy', 'pink', 'ice', 'green']),
  descriptionEs: z.string().trim().min(1).max(2000),
  descriptionEn: z.string().trim().min(1).max(2000),
  stocks: productStocksSchema,
  prices: productPricesSchema,
  media: z.array(z.string().startsWith('/assets/')).min(1).max(20),
  mobileImage: z.string().startsWith('/assets/').optional().or(z.literal('')),
  video: z.string().startsWith('/assets/').optional().or(z.literal('')),
  isNew: z.boolean().optional(),
});

export const inventorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  stocks: productStocksSchema.optional(),
  prices: productPricesSchema.optional(),
});

export const merchProductSchema = z.object({
  id: z.string().trim().min(1).max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(100),
  descriptionEs: z.string().trim().max(2000),
  descriptionEn: z.string().trim().max(2000),
  priceCents: z.number().int().min(0).max(10_000_000),
  inventory: z.number().int().min(0).max(100_000),
  active: z.boolean(),
  images: z.array(z.string().startsWith('/assets/')).max(12),
  variants: z
    .array(
      z.object({
        size: z.string().trim().max(40).optional(),
        color: z.string().trim().max(40).optional(),
      }),
    )
    .max(100),
  productType: z.literal('merch'),
});
