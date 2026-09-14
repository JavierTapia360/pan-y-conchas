# Content guide

Use Admin for availability, featured state, display order, names, descriptions and media ordering. Use code files only for fallback/source changes:

- `data/products.ts`: product fallback records
- `data/assets.ts`: every supplied image/video path
- `locales/en.ts` and `locales/es.ts`: bilingual interface
- `data/site.ts`: public email, social links and legal availability line

Keep product folders isolated. Do not infer potency, genetics, effects, medical claims, licensing, origin or awards from photographs. Unknown information stays hidden or explicitly pending.

The asset verification script checks every mapped file. Original filenames and bytes must remain unchanged. New uploads should use R2/CDN storage, explicit MIME allowlists, size limits, safe generated filenames and separate focal-point metadata.
