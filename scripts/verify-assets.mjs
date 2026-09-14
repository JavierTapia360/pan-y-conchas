import fs from 'node:fs';
import path from 'node:path';
const source = fs.readFileSync(new URL('../data/assets.ts', import.meta.url), 'utf8');
const paths = [...source.matchAll(/\$\{root\}\/([^`]+)`/g)].map((match) => match[1]);
const supported = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.mp4', '.webm']);
const missing = paths.filter((item) => !fs.existsSync(path.resolve('public/assets', item)));
const unsupported = paths.filter((item) => !supported.has(path.extname(item).toLowerCase()));
const duplicates = paths.filter((item, index) => paths.indexOf(item) !== index);
if (missing.length || unsupported.length || duplicates.length) {
  console.error(JSON.stringify({ missing, unsupported, duplicates }, null, 2));
  process.exit(1);
}
console.log(`Verified ${paths.length} asset references.`);
