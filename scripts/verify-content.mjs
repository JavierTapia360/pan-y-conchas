import fs from 'node:fs';
import path from 'node:path';
const products = fs.readFileSync(
  new URL('../data/products.ts', import.meta.url),
  'utf8',
);
const slugs = [...products.matchAll(/slug: '([^']+)'/g)].map(
  (match) => match[1],
);
const invalid = slugs.filter(
  (slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug),
);
const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
const en = fs.readFileSync(
  new URL('../locales/en.ts', import.meta.url),
  'utf8',
);
const es = fs.readFileSync(
  new URL('../locales/es.ts', import.meta.url),
  'utf8',
);
const topKeys = (text) =>
  [...text.matchAll(/^  ([a-zA-Z]+):/gm)].map((match) => match[1]);
const missing = topKeys(en)
  .filter((key) => !topKeys(es).includes(key))
  .concat(topKeys(es).filter((key) => !topKeys(en).includes(key)));
const requiredNames = ['MAC 1', 'JELLY DONUT', 'SKITTLES', 'FROSTED FUEL'];
const absentNames = requiredNames.filter(
  (name) => !products.includes(`name: '${name}'`),
);
const forbiddenNames = [
  'J' + 'OLLY DONUT',
  'JELLY DONUT' + 'Z',
  'Z' + 'KITTLEZ',
  'SKITTLE' + 'Z',
];
const oldNames = forbiddenNames.filter((name) =>
  products.toUpperCase().includes(name),
);
const videoCount = [...products.matchAll(/video: assets\./g)].length;
const sourceRoots = ['app', 'components', 'data', 'features', 'hooks', 'lib'];
const sourceFiles = sourceRoots.flatMap((root) =>
  fs.existsSync(root)
    ? fs
        .readdirSync(root, { recursive: true })
        .filter((entry) => /\.(?:ts|tsx)$/.test(String(entry)))
        .map((entry) => path.join(root, String(entry)))
    : [],
);
const sourceText = sourceFiles
  .map((file) => `${file}\n${fs.readFileSync(file, 'utf8')}`)
  .join('\n');
const forbiddenArchitecture = [
  "fetch('/api",
  'drizzle-orm',
  'D1Database',
  'SUPABASE_URL',
  'STRIPE_SECRET_KEY',
  'PAYPAL_CLIENT_SECRET',
  "from 'next/link'",
  'useRouter(',
];
const architectureLeaks = forbiddenArchitecture.filter((token) =>
  sourceText.includes(token),
);
const forbiddenComponentPrices = ['$520', '$470', '$450', '$200', '$180'];
const visualSource = sourceFiles
  .filter((file) => file.startsWith(`components${path.sep}`))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const duplicatedPrices = forbiddenComponentPrices.filter((price) =>
  visualSource.includes(price),
);
const apiRouteExists = sourceFiles.some((file) =>
  file.startsWith(`app${path.sep}api${path.sep}`),
);
if (
  invalid.length ||
  duplicates.length ||
  missing.length ||
  absentNames.length ||
  oldNames.length ||
  videoCount !== 4 ||
  apiRouteExists ||
  architectureLeaks.length ||
  duplicatedPrices.length
) {
  console.error(
    JSON.stringify(
      {
        invalid,
        duplicates,
        missing,
        absentNames,
        oldNames,
        videoCount,
        apiRouteExists,
        architectureLeaks,
        duplicatedPrices,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
console.log(
  `Verified ${slugs.length} product slugs, definitive names, 4 videos, locale namespaces and static-only architecture.`,
);
