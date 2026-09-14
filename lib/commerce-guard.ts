import type { MerchProduct } from '@/data/merch';

export function assertMerchProduct(product: Pick<MerchProduct, 'productType'>) {
  if (product.productType !== 'merch')
    throw new Error('REGULATED_CATALOG_PRODUCT_REJECTED');
  return true;
}
