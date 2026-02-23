import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const GALLERY_DIR = join(import.meta.dirname, '..', 'public', 'images', 'gallery');
const THUMB_DIR = join(GALLERY_DIR, 'thumb');
const FULL_DIR = join(GALLERY_DIR, 'full');

const SIZES = {
  thumb: { width: 400, quality: 80, dir: THUMB_DIR },
  full: { width: 1200, quality: 85, dir: FULL_DIR },
};

const SUPPORTED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function optimizeImages() {
  // Create output directories
  for (const { dir } of Object.values(SIZES)) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  // Read source images (skip subdirectories)
  const files = (await readdir(GALLERY_DIR, { withFileTypes: true }))
    .filter((f) => f.isFile() && SUPPORTED_EXTS.has(extname(f.name).toLowerCase()))
    .map((f) => f.name);

  console.log(`Found ${files.length} images to optimize\n`);

  let totalOriginal = 0;
  let totalThumb = 0;
  let totalFull = 0;

  for (const file of files) {
    const inputPath = join(GALLERY_DIR, file);
    const nameNoExt = basename(file, extname(file));
    const outName = `${nameNoExt}.webp`;

    const inputMeta = await sharp(inputPath).metadata();
    const inputSize = inputMeta.size || 0;
    totalOriginal += inputSize;

    // Generate thumb
    const thumbPath = join(THUMB_DIR, outName);
    const thumbInfo = await sharp(inputPath)
      .rotate() // auto-rotate based on EXIF
      .resize(SIZES.thumb.width, null, { withoutEnlargement: true })
      .webp({ quality: SIZES.thumb.quality })
      .toFile(thumbPath);
    totalThumb += thumbInfo.size;

    // Generate full
    const fullPath = join(FULL_DIR, outName);
    const fullInfo = await sharp(inputPath)
      .rotate()
      .resize(SIZES.full.width, null, { withoutEnlargement: true })
      .webp({ quality: SIZES.full.quality })
      .toFile(fullPath);
    totalFull += fullInfo.size;

    console.log(
      `${file}: ${fmt(inputSize)} -> thumb ${fmt(thumbInfo.size)}, full ${fmt(fullInfo.size)}`
    );
  }

  console.log(`\n--- Summary ---`);
  console.log(`Original total : ${fmt(totalOriginal)}`);
  console.log(`Thumbs total   : ${fmt(totalThumb)} (${files.length} files)`);
  console.log(`Full total     : ${fmt(totalFull)} (${files.length} files)`);
  console.log(`Savings        : ${fmt(totalOriginal - totalThumb - totalFull)} (${((1 - (totalThumb + totalFull) / totalOriginal) * 100).toFixed(1)}%)`);
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

optimizeImages().catch((err) => {
  console.error('Image optimization failed:', err);
  process.exit(1);
});
