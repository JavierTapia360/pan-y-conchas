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
const jpegDimensions = (buffer) => {
  let offset = 2;
  const startOfFrame = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce,
    0xcf,
  ]);
  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = buffer.readUInt16BE(offset);
    if (startOfFrame.has(marker))
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    offset += length;
  }
  return null;
};
const imageDimensions = (file) => {
  const buffer = fs.readFileSync(file);
  if (path.extname(file).toLowerCase() === '.png')
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  if (/\.jpe?g$/i.test(file)) return jpegDimensions(buffer);
  return null;
};
const invalidFlowerDimensions = flowerImages.flatMap((item) => {
  const file = path.resolve('public/assets', item);
  if (!fs.existsSync(file)) return [item];
  const dimensions = imageDimensions(file);
  if (!dimensions) return [item];
  const { width, height } = dimensions;
  const isPrincipal = item.endsWith('/principal.png');
  const valid = isPrincipal
    ? width === 1254 && height === 1254
    : width >= 500 && height >= 700;
  return valid ? [] : [`${item}: ${width}x${height}`];
});
const expectedFlowerCounts = {
  'flower/mac-1/': 4,
  'flower/jelly-donut/': 5,
  'flower/skittles/': 4,
  'flower/frosted-fuel/': 5,
};
const invalidFlowerCounts = Object.entries(expectedFlowerCounts).filter(
  ([prefix, expected]) =>
    flowerImages.filter((item) => item.startsWith(prefix)).length !== expected,
);
if (
  missing.length ||
  unsupported.length ||
  duplicates.length ||
  flowerImages.length !== 18 ||
  invalidFlowerCounts.length ||
  invalidFlowerDimensions.length
) {
  console.error(
    JSON.stringify(
      {
        missing,
        unsupported,
        duplicates,
        flowerImageCount: flowerImages.length,
        invalidFlowerCounts,
        invalidFlowerDimensions,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
console.log(
  `Verified ${paths.length} asset references, including 18 approved gallery images and four unchanged 1254x1254 principals.`,
);
