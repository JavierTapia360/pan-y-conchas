# CUATESFARMZ

Premium bilingual static catalog with a browser-only cart and local editing panel.

## Stack

Vinext/Next.js App Router, React 19, TypeScript, Motion and Zod. The project has no backend, database, remote API, checkout, payments, orders or shipping.

## Run locally

1. Install Node.js 22.13+.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the local URL shown in the terminal.

## Commands

- `npm run dev` — development
- `npm run verify-assets` — media integrity
- `npm run verify-content` — catalog and architecture integrity
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run qa` — complete automated check

## Local source of truth

- Product defaults, variants, stock, prices, bilingual descriptions and media: `data/products.ts`
- Asset paths: `data/assets.ts`
- English and Spanish UI: `locales/en.ts` and `locales/es.ts`
- Contact/social display values: `data/site.ts`

`CatalogProvider` overlays valid browser-local edits stored under `gf_catalog_local_v1`. Every storefront surface reads that same catalog context. `/admin` edits only this browser; it never claims to publish globally.

The Flower cart is stored under `gf_cart_v1`. It validates every line against current local stock, never changes inventory and ends at the in-browser order summary. Contact, newsletter and consented analytics are also local-only.

Original media remains under `public/assets/`. Each Flower variety uses its own official HD video. WAX has no video.

See `docs/` for the local architecture and editing workflow.
