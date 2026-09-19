import { describe, expect, it } from 'vitest';
import { detectLanguageFrom } from '@/lib/language';
import { statusToAvailability } from '@/lib/availability';
import { assertMerchProduct } from '@/lib/commerce-guard';
import { hasAvailablePresentation, products } from '@/data/products';
import { assets } from '@/data/assets';
import {
  getCatalogPresentationLabel,
  getCatalogPrice,
} from '@/data/catalog-cart';
import { waxProduct } from '@/data/wax';
import {
  contactSchema,
  adminProductSchema,
  inventorySchema,
  merchProductSchema,
  newsletterSchema,
} from '@/lib/validation';
import { normalizeLocalProduct } from '@/lib/local-catalog';
import { normalizeLocalWaxSettings } from '@/lib/local-wax';
import { reconcileCartItems } from '@/components/catalog-cart-provider';
import { buildTelegramOrderText, buildTelegramOrderUrl } from '@/lib/telegram';
import { en } from '@/locales/en';
import { es } from '@/locales/es';

describe('core rules', () => {
  it('manual locale wins over browser locale', () =>
    expect(detectLanguageFrom('en', ['es-MX'])).toBe('en'));
  it('detects Spanish and falls back to English', () => {
    expect(detectLanguageFrom(null, ['es-MX', 'en-US'])).toBe('es');
    expect(detectLanguageFrom(null, ['fr-FR'])).toBe('en');
  });
  it('maps every availability state', () => {
    expect(statusToAvailability('AVAILABLE')).toBe(true);
    expect(statusToAvailability('SOLD_OUT')).toBe(false);
    expect(statusToAvailability('HIDDEN')).toBeNull();
  });
  it('keeps product slugs valid and unique', () => {
    const slugs = products.map((product) => product.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(
      true,
    );
  });
  it('uses the definitive product names, prices and one unique Flower video', () => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    expect(bySlug.get('mac-1')).toMatchObject({
      name: 'MAC 1',
      prices: { qp: 52000, oz: 20000, halfOz: 11000 },
    });
    expect(bySlug.get('jelly-donut')).toMatchObject({
      name: 'JELLY DONUT',
      prices: { qp: 47000, oz: 18000, halfOz: 9000 },
    });
    expect(bySlug.get('skittles')).toMatchObject({
      name: 'SKITTLES',
      prices: { qp: 47000, oz: 18000, halfOz: 9000 },
    });
    expect(bySlug.get('frosted-fuel')).toMatchObject({
      name: 'FROSTED FUEL',
      prices: { qp: 45000, oz: 17000, halfOz: 8000 },
    });
    const videos = products.map((product) => product.video);
    expect(videos.every(Boolean)).toBe(true);
    expect(new Set(videos).size).toBe(4);
    expect(
      products.every(
        (product) =>
          product.videoPoster && !product.images.includes(product.videoPoster),
      ),
    ).toBe(true);
    expect('video' in assets.wax).toBe(false);
  });
  it('uses the final bilingual slogan and product attributes without THC', () => {
    expect(es.about.title).toBe(
      'CULTIVANDO SUEÑOS, COSECHANDO LO EXTRAORDINARIO',
    );
    expect(en.about.title).toBe(
      'CULTIVATING DREAMS, HARVESTING THE EXTRAORDINARY',
    );

    const bySlug = new Map(products.map((product) => [product.slug, product]));
    expect(bySlug.get('mac-1')?.attributes).toEqual({
      en: ['HYBRID', 'GAS / CANDY', 'EUPHORIA', 'HAPPY', 'CREATIVITY'],
      es: ['HÍBRIDA', 'GAS / CANDY', 'EUFORIA', 'ALEGRE', 'CREATIVIDAD'],
    });
    expect(bySlug.get('jelly-donut')?.attributes).toEqual({
      en: ['HYBRID', 'CANDY', 'JOYFUL', 'RELAXING'],
      es: ['HÍBRIDA', 'CANDY', 'ALEGRÍA', 'RELAJANTE'],
    });
    expect(bySlug.get('skittles')?.attributes).toEqual({
      en: ['INDICA', 'SWEET', 'RELAXING', 'HAPPY'],
      es: ['ÍNDICA', 'DULCE', 'RELAJANTE', 'ALEGRE'],
    });
    expect(bySlug.get('frosted-fuel')?.attributes).toEqual({
      en: ['HYBRID', 'SWEET', 'EUPHORIA', 'RELAXATION', 'CREATIVITY'],
      es: ['HÍBRIDA', 'DULCE', 'EUFORIA', 'RELAJACIÓN', 'CREATIVIDAD'],
    });
    expect(JSON.stringify(products)).not.toMatch(/THC/i);
  });
  it('keeps every Flower principal first and every gallery source unique', () => {
    const galleryImages = products.flatMap((product) => product.images);
    expect(
      products.find((product) => product.slug === 'skittles')?.images,
    ).toHaveLength(4);
    expect(
      products
        .filter((product) => product.slug !== 'skittles')
        .every((product) => product.images.length === 5),
    ).toBe(true);
    expect(
      products.every((product) => product.images[0].endsWith('/principal.png')),
    ).toBe(true);
    expect(new Set(galleryImages).size).toBe(19);
  });
  it('keeps WAX on binary availability with the definitive pack prices', () => {
    expect(waxProduct).toMatchObject({
      slug: 'wax',
      available: true,
      inventoryMode: 'availability',
      prices: { pieces5: 10000, pieces10: 19000, pieces25: 35000 },
      perPiecePrices: { pieces5: 2000, pieces10: 1900, pieces25: 1400 },
    });
    expect('stocks' in waxProduct).toBe(false);
    expect(getCatalogPresentationLabel('pieces5', 'es')).toBe('5 PIEZAS');
    expect(getCatalogPresentationLabel('pieces5', 'en')).toBe('5 PIECES');
    expect(getCatalogPrice(waxProduct, 'pieces25')).toBe(35000);
  });
  it('normalizes local WAX availability without inventing stock', () => {
    expect(normalizeLocalWaxSettings({ available: false })).toEqual({
      available: false,
      updatedAt: null,
    });
    expect(normalizeLocalWaxSettings({ available: 'no' })).toEqual({
      available: true,
      updatedAt: null,
    });
  });
  it('keeps WAX cart quantities without inventing a numeric stock limit', () => {
    const items = [
      { slug: 'wax', presentation: 'pieces10' as const, quantity: 3 },
    ];
    expect(reconcileCartItems(items, [waxProduct]).items).toEqual(items);
    expect(
      reconcileCartItems(items, [{ ...waxProduct, available: false }]).items,
    ).toEqual([]);
  });
  it('derives the simple product status from presentation availability', () => {
    expect(hasAvailablePresentation({ halfOz: 0, oz: 1, qp: 0 })).toBe(true);
    expect(hasAvailablePresentation({ halfOz: 0, oz: 0, qp: 0 })).toBe(false);
  });
  it('rejects regulated catalog products from merch commerce', () => {
    expect(() =>
      assertMerchProduct({ productType: 'catalog' } as never),
    ).toThrow('REGULATED_CATALOG_PRODUCT_REJECTED');
  });
  it('validates contact payloads', () => {
    expect(
      contactSchema.safeParse({
        name: 'Ana',
        email: 'ana@example.com',
        state: 'CA',
        subject: 'Hello',
        message: 'A general question.',
        language: 'es',
        company_website: '',
      }).success,
    ).toBe(true);
    expect(
      contactSchema.safeParse({
        name: 'A',
        email: 'bad',
        state: '',
        subject: '',
        message: 'x',
        language: 'es',
      }).success,
    ).toBe(false);
  });
  it('requires explicit newsletter consent', () => {
    expect(
      newsletterSchema.safeParse({
        email: 'ana@example.com',
        language: 'es',
        consent: true,
      }).success,
    ).toBe(true);
    expect(
      newsletterSchema.safeParse({
        email: 'ana@example.com',
        language: 'es',
        consent: false,
      }).success,
    ).toBe(false);
  });
  it('accepts only the isolated merch model', () => {
    expect(
      merchProductSchema.safeParse({
        id: 'shirt-1',
        slug: 'shirt-1',
        name: 'Shirt',
        descriptionEs: '',
        descriptionEn: '',
        priceCents: 2500,
        inventory: 2,
        active: false,
        images: [],
        variants: [{ size: 'M' }],
        productType: 'merch',
      }).success,
    ).toBe(true);
    expect(
      merchProductSchema.safeParse({
        id: 'flower',
        slug: 'flower',
        name: 'Flower',
        descriptionEs: '',
        descriptionEn: '',
        priceCents: 1,
        inventory: 1,
        active: true,
        images: [],
        variants: [],
        productType: 'catalog',
      }).success,
    ).toBe(false);
  });
  it('validates inventory without accepting negative or fractional stock', () => {
    expect(
      inventorySchema.safeParse({
        slug: 'skittles',
        stocks: { halfOz: 8, oz: 4, qp: 1 },
      }).success,
    ).toBe(true);
    expect(
      inventorySchema.safeParse({
        slug: 'skittles',
        stocks: { halfOz: -1, oz: 4, qp: 1 },
      }).success,
    ).toBe(false);
    expect(
      inventorySchema.safeParse({
        slug: 'skittles',
        stocks: { halfOz: 1.5, oz: 4, qp: 1 },
      }).success,
    ).toBe(false);
  });
  it('caps a saved cart to current stock and removes sold-out lines', () => {
    const reconciled = reconcileCartItems(
      [
        { slug: 'skittles', presentation: 'qp', quantity: 4 },
        { slug: 'frosted-fuel', presentation: 'halfOz', quantity: 2 },
      ],
      [
        {
          slug: 'skittles',
          stocks: { halfOz: 5, oz: 3, qp: 2 },
          prices: { qp: 47000, oz: 18000, halfOz: 9000 },
          hidden: false,
        },
        {
          slug: 'frosted-fuel',
          stocks: { halfOz: 0, oz: 2, qp: 1 },
          prices: { qp: 45000, oz: 17000, halfOz: 8000 },
          hidden: false,
        },
      ],
    );
    expect(reconciled.items).toEqual([
      { slug: 'skittles', presentation: 'qp', quantity: 2 },
    ]);
    expect(reconciled.adjustment).toEqual({
      slug: 'skittles',
      presentation: 'qp',
      stock: 2,
    });
  });
  it('normalizes invalid local edits without accepting negative values', () => {
    const fallback = products[0];
    const normalized = normalizeLocalProduct(
      {
        ...fallback,
        name: '  LOCAL NAME  ',
        stocks: { halfOz: -2, oz: 3.4, qp: 2 },
        prices: { halfOz: -100, oz: null, qp: 52000 },
      },
      fallback,
    );
    expect(normalized.name).toBe('LOCAL NAME');
    expect(normalized.stocks).toEqual({
      ...fallback.stocks,
      qp: 2,
    });
    expect(normalized.prices).toEqual({
      ...fallback.prices,
      oz: null,
      qp: 52000,
    });
    expect(normalized.available).toBe(true);
  });
  it('migrates the untouched former FROSTED FUEL sold-out default', () => {
    const fallback = products.find(
      (product) => product.slug === 'frosted-fuel',
    )!;
    const normalized = normalizeLocalProduct(
      {
        ...fallback,
        stocks: { halfOz: 0, oz: 0, qp: 0 },
        available: false,
        updatedAt: null,
      },
      fallback,
    );

    expect(normalized.stocks).toEqual(fallback.stocks);
    expect(normalized.available).toBe(true);
  });
  it('preserves an explicit Admin sold-out edit for FROSTED FUEL', () => {
    const fallback = products.find(
      (product) => product.slug === 'frosted-fuel',
    )!;
    const updatedAt = '2026-09-17T06:00:00.000Z';
    const normalized = normalizeLocalProduct(
      {
        ...fallback,
        stocks: { halfOz: 0, oz: 0, qp: 0 },
        available: false,
        updatedAt,
      },
      fallback,
    );

    expect(normalized.stocks).toEqual({ halfOz: 0, oz: 0, qp: 0 });
    expect(normalized.available).toBe(false);
    expect(normalized.updatedAt).toBe(updatedAt);
  });
  it('removes hidden products from a saved catalog cart', () => {
    expect(
      reconcileCartItems(
        [{ slug: 'mac-1', presentation: 'oz', quantity: 1 }],
        [
          {
            slug: 'mac-1',
            stocks: { halfOz: 12, oz: 12, qp: 12 },
            prices: { qp: 52000, oz: 20000, halfOz: 11000 },
            hidden: true,
          },
        ],
      ).items,
    ).toEqual([]);
  });
  it('requires stock and nullable presentation prices for admin saves', () => {
    const product = products[0];
    expect(
      adminProductSchema.safeParse({
        slug: product.slug,
        name: product.name,
        status: 'AVAILABLE',
        featured: true,
        active: true,
        sortOrder: 0,
        accent: product.accent,
        descriptionEs: product.description.es,
        descriptionEn: product.description.en,
        stocks: { halfOz: 8, oz: 4, qp: 1 },
        prices: { halfOz: null, oz: 20000, qp: 52000 },
        media: [...product.images],
        video: product.video || '',
      }).success,
    ).toBe(true);
  });
  it('enforces an independent stock limit for each presentation', () => {
    const reconciled = reconcileCartItems(
      [
        { slug: 'mac-1', presentation: 'qp', quantity: 2 },
        { slug: 'mac-1', presentation: 'oz', quantity: 2 },
      ],
      [
        {
          slug: 'mac-1',
          stocks: { halfOz: 0, oz: 3, qp: 1 },
          prices: { qp: 52000, oz: 20000, halfOz: null },
          hidden: false,
        },
      ],
    );
    expect(reconciled.items).toEqual([
      { slug: 'mac-1', presentation: 'qp', quantity: 1 },
      { slug: 'mac-1', presentation: 'oz', quantity: 2 },
    ]);
    expect(reconciled.adjustment).toEqual({
      slug: 'mac-1',
      presentation: 'qp',
      stock: 1,
    });
  });
  it('removes a saved line when its presentation price is null', () => {
    expect(
      reconcileCartItems(
        [{ slug: 'mac-1', presentation: 'halfOz', quantity: 1 }],
        [
          {
            slug: 'mac-1',
            stocks: { halfOz: 12, oz: 12, qp: 12 },
            prices: { qp: 52000, oz: 20000, halfOz: null },
            hidden: false,
          },
        ],
      ).items,
    ).toEqual([]);
  });
  it('builds an encoded Telegram order handoff with cart and customer data', () => {
    const order = {
      language: 'es' as const,
      lines: [
        {
          name: 'MAC 1',
          presentation: 'oz' as const,
          quantity: 2,
          unitPriceCents: 20000,
        },
      ],
      subtotalCents: 40000,
      customer: {
        name: 'Ana Pérez',
        address: '123 Main St',
        residenceType: 'apartment' as const,
        apartmentNumber: '4B',
        buildingTower: 'Torre Norte',
        city: 'Los Angeles',
        state: 'California',
        zip: '90001',
        phone: '+1 555 0100',
        notes: 'Tocar el timbre una vez.',
      },
    };
    const text = buildTelegramOrderText(order);
    expect(text).toContain('MAC 1 / Oz');
    expect(text).toContain('Cantidad: 2');
    expect(text).toContain('SUBTOTAL: $400.00');
    expect(text).toContain('Nombre: Ana Pérez');
    expect(text).toContain('Tipo de vivienda: Departamento');
    expect(text).toContain('Número de departamento: 4B');
    expect(text).toContain('Edificio / Torre: Torre Norte');
    expect(text).toContain('Notas de entrega: Tocar el timbre una vez.');
    const url = buildTelegramOrderUrl(order);
    expect(url).toMatch(/^https:\/\/t\.me\/Cuatesfarmzzz\?text=/);
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(text);
  });
  it('translates WAX packs and residence details in the English order text', () => {
    const text = buildTelegramOrderText({
      language: 'en',
      lines: [
        {
          name: 'WAX',
          presentation: 'pieces25',
          quantity: 2,
          unitPriceCents: 35000,
        },
      ],
      subtotalCents: 70000,
      customer: {
        name: 'Alex',
        address: '10 Market St',
        residenceType: 'house',
        city: 'San Diego',
        state: 'California',
        zip: '92101',
        phone: '+1 555 0200',
      },
    });
    expect(text).toContain('WAX / 25 PIECES');
    expect(text).toContain('Quantity: 2');
    expect(text).toContain('SUBTOTAL: $700.00');
    expect(text).toContain('Residence type: House');
  });
});
