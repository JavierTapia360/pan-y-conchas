export type MerchProduct = {
  id: string;
  slug: string;
  name: string;
  description: { en: string; es: string };
  priceCents: number;
  inventory: number;
  active: boolean;
  images: string[];
  variants: { size?: string; color?: string }[];
  productType: 'merch';
};

// No public merch items are invented. Add approved inventory here or through Admin.
export const merchProducts: MerchProduct[] = [];
