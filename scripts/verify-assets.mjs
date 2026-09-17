import fs from 'node:fs';
import path from 'node:path';
const source = fs.readFileSync(
  new URL('../data/assets.ts', import.meta.url),
  'utf8',
);
const paths = [...source.matchAll(/\$\{root\}\/([^`]+)`/g)].map(
  (match) => match[1],
);
const supported = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.mp4',
  '.webm',
]);
const missing = paths.filter(
  (item) => !fs.existsSync(path.resolve('public/assets', item)),
);
const unsupported = paths.filter(
  (item) => !supported.has(path.extname(item).toLowerCase()),
);
const duplicates = paths.filter((item, index) => paths.indexOf(item) !== index);
const flowerImages = paths.filter((item) => item.startsWith('flower/'));
const invalidFlowerDimensions = flowerImages.flatMap((item) => {
  const file = path.resolve('public/assets', item);
  if (!fs.existsSync(file) || path.extname(file).toLowerCase() !== '.png')
    return [item];
  const buffer = fs.readFileSync(file);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return width === 1254 && height === 1254
    ? []
    : [`${item}: ${width}x${height}`];
});
if (
  missing.length ||
  unsupported.length ||
  duplicates.length ||
  flowerImages.length !== 20 ||
  invalidFlowerDimensions.length
) {
  console.error(
    JSON.stringify(
      {
        missing,
        unsupported,
        duplicates,
        flowerImageCount: flowerImages.length,
        invalidFlowerDimensions,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
console.log(
  `Verified ${paths.length} asset references, including 20 square Flower images at 1254x1254.`,
);
