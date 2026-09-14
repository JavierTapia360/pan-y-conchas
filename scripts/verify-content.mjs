import fs from 'node:fs';
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
if (
  invalid.length ||
  duplicates.length ||
  missing.length ||
  absentNames.length ||
  oldNames.length ||
  videoCount !== 4
) {
  console.error(
    JSON.stringify(
      { invalid, duplicates, missing, absentNames, oldNames, videoCount },
      null,
      2,
    ),
  );
  process.exit(1);
}
console.log(
  `Verified ${slugs.length} product slugs, definitive names, 4 videos and locale namespaces.`,
);
