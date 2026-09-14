# CUATESFARMZ

Premium bilingual catalog, brand site, admin CMS foundation and isolated merchandise commerce architecture.

## Stack

Vinext/Next.js App Router, React 19, TypeScript, Tailwind CSS, Motion, D1/SQLite, Drizzle and Zod. Public Flower/Wax content is catalog-only. Conventional merchandise uses a separate model and server guard.

## Run locally

1. Install Node.js 22.13+.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill only the integrations you use.
4. Run `npm run dev`.
5. Open the Local URL printed by the terminal.

The Sites development runtime provides a local D1 binding. Production migrations live in `drizzle/`.

## Commands

- `npm run dev` — development
- `npm run verify-assets` — missing/duplicate/unsupported media references
- `npm run verify-content` — product slugs and locale namespaces
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run qa` — complete automated check

## Content map

- Products and availability fallback: `data/products.ts`
- Explicit asset map: `data/assets.ts`
- English: `locales/en.ts`
- Spanish: `locales/es.ts`
- Email and social links: `data/site.ts`
- Feature flags: `features/features.ts`
- Commerce boundary: `features/commerce.ts`
- Admin: `/admin`

Original media remains unchanged under `public/assets/<original folder>/<original filename>`. Web-only derivatives correct the brand spelling to **CUATESFARMZ** with a clear C: `public/assets/cuatesfarmz-logo-c.png` plus the desktop and mobile hero derivatives. Optimized WebP copies are served publicly while original PNG files remain untouched for provenance.

## First administrator

Production admin access uses the hosting platform’s authenticated user header plus the server-only `ADMIN_EMAILS` allowlist. Add the owner’s approved email to the environment variable; never commit it. There is no public registration and no locally stored password. Add more comma-separated emails for editors only after defining role policy.

## Database and admin

D1 stores product overrides, media order, published content settings, contact messages, newsletter consent, privacy-safe analytics events, merch inventory and merch-only orders. Static product data remains a safe fallback. Admin writes are validated with Zod and same-origin checks. The responsive control room includes Flower, Wax, content, local media selection, messages, newsletter, merch, orders and verified contact/social settings. Run and inspect Drizzle migrations through the Sites deployment workflow.

## Merchandise payments

No payment session is created until approved merchandise inventory, shipping configuration and sandbox provider credentials exist. The storefront, variant-aware cart, address validation and provider boundary are implemented; Stripe and PayPal adapters remain server-only placeholders until credentials are supplied. Apple Pay must be exposed only after browser/device support, merchant configuration and domain verification are confirmed. Flower and Wax are rejected from commerce on the server.

## Email and analytics

Contact confirmation, owner notification and newsletter welcome templates use Resend when `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and, for owner notifications, `CONTACT_NOTIFICATION_EMAIL` are configured. Without credentials, submissions are still stored and no email is claimed as sent. First-party analytics is disabled until the visitor accepts the privacy banner and stores no names, emails, precise addresses or raw IPs.

## Deployment

The project is registered with OpenAI Sites and its preview/production lifecycle is managed by the Sites deployment flow. For a separate Vercel setup, mirror environment variables by Development/Preview/Production and connect the repository; do not reuse production payment keys in previews. Domain DNS records depend on the selected host/registrar.

## Production checklist

Supply and approve: product availability, contact email, social URLs, legal copy, brand story, administrator emails, merch imagery/variants/prices/inventory, shipping rates, payment sandbox keys, email domain SPF/DKIM and any analytics consent policy. Configure provider webhooks before enabling checkout. Schedule D1 exports/backups and storage redundancy.

See `docs/` for architecture, content, admin, deployment, commerce and design details.
