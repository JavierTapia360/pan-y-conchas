import { describe, expect, it } from 'vitest';
import { detectLanguageFrom } from '@/components/language-provider';
import { statusToAvailability } from '@/lib/availability';
import { assertMerchProduct } from '@/lib/commerce-guard';
import { products } from '@/data/products';
import { assets } from '@/data/assets';
import {
  contactSchema,
  adminProductSchema,
  inventorySchema,
  merchProductSchema,
  newsletterSchema,
} from '@/lib/validation';
import { isSameOriginMutation } from '@/lib/api-response';
import {
  toggleComparisonItems,
  reconcileSelectionItems,
  toggleSelectionItems,
  type SelectionItem,
} from '@/components/selection-provider';
import { reconcileCartItems } from '@/components/catalog-cart-provider';

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
    expect('video' in assets.wax).toBe(false);
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
  it('rejects cross-origin mutations', () => {
    expect(
      isSameOriginMutation(
        new Request('https://example.com/api', {
          method: 'POST',
          headers: { origin: 'https://example.com' },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOriginMutation(
        new Request('https://example.com/api', {
          method: 'POST',
          headers: { origin: 'https://evil.example' },
        }),
      ),
    ).toBe(false);
  });
  it('adds and removes catalog selections without quantities', () => {
    const item: SelectionItem = {
      id: 'flower:mac-1',
      kind: 'flower',
      slug: 'mac-1',
      name: 'MAC 1',
      image: '/mac.webp',
    };
    const added = toggleSelectionItems([], item);
    expect(added).toEqual([item]);
    expect(toggleSelectionItems(added, item)).toEqual([]);
  });
  it('refreshes saved selection names from the central catalog', () => {
    const product = products.find((item) => item.slug === 'skittles')!;
    expect(
      reconcileSelectionItems(
        [
          {
            id: 'flower:skittles',
            kind: 'flower',
            slug: 'skittles',
            name: 'Outdated catalog name',
            image: '/old.webp',
          },
        ],
        [{ ...product, featured: true, hidden: false }],
      ),
    ).toEqual([expect.objectContaining({ name: 'SKITTLES' })]);
  });
  it('limits visual comparison to three catalog items', () => {
    const entries: SelectionItem[] = ['one', 'two', 'three', 'four'].map(
      (id) => ({ id, kind: 'flower', name: id, image: `/${id}.webp` }),
    );
    const compared = entries
      .slice(0, 3)
      .reduce(toggleComparisonItems, [] as SelectionItem[]);
    expect(toggleComparisonItems(compared, entries[3])).toHaveLength(3);
    expect(
      toggleComparisonItems(compared, entries[1]).map((item) => item.id),
    ).toEqual(['one', 'three']);
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
  it('caps a saved cart to current stock and preserves sold-out lines at zero', () => {
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
        },
        {
          slug: 'frosted-fuel',
          stocks: { halfOz: 0, oz: 2, qp: 1 },
          prices: { qp: 45000, oz: 17000, halfOz: 8000 },
        },
      ],
    );
    expect(reconciled.items).toEqual([
      { slug: 'skittles', presentation: 'qp', quantity: 2 },
      { slug: 'frosted-fuel', presentation: 'halfOz', quantity: 0 },
    ]);
    expect(reconciled.adjustment).toEqual({
      slug: 'skittles',
      presentation: 'qp',
      stock: 2,
    });
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
          },
        ],
      ).items,
    ).toEqual([]);
  });
});
