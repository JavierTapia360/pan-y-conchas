# Architecture

Public routes render the brand narrative and catalog. `data/products.ts` and `data/assets.ts` provide audited fallback content; `/api/catalog` overlays D1 records so availability, ordering, featured state, descriptions and media update from Admin.

Interactive providers are limited to language, age verification and merch cart. Videos are mounted only near interaction. Server routes own validation, persistence, admin authorization and commerce eligibility.

D1 schema is in `db/schema.ts`; immutable generated migrations are in `drizzle/`. Public read, admin write and merch checkout endpoints remain separate. Cloudflare-compatible Worker output is produced by Vinext.

Authentication relies on hosting-provided identity headers and a server-only administrator allowlist. Future OWNER/EDITOR RBAC should be stored server-side; editors may update product/content/media but never authorization.
