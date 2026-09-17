# Architecture

The application is a static Vinext/Next.js storefront. It has no API routes, server authentication, database bindings or external persistence.

`data/products.ts` is the canonical checked-in catalog. `CatalogProvider` applies validated overrides from `gf_catalog_local_v1` and exposes one catalog context to Home, Flower, product detail, cart and Admin. The browser cannot add arbitrary products or change stable slugs.

Cart data is client-side under `gf_cart_v1`. Reconciliation clamps each product/presentation quantity to current stock and removes hidden, invalid, unavailable or unpriced lines. Adding to the cart never decrements stock.

Messages, newsletter entries and consented anonymous metrics are browser-local conveniences, not submissions to a remote service. A real multi-user Admin would require a separate future backend project and is intentionally out of scope.
