import sharp from 'sharp';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 20 * 1024 * 1024; // 20MB
const THUMBNAIL_WIDTH = 400;

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPG, WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 20MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = nanoid();
    const ext = file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg';
    const filename = `${fileId}${ext}`;

    // Ensure upload directories exist
    const originalsDir = path.join(process.cwd(), 'public', 'uploads', 'originals');
    const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');
    await fs.mkdir(originalsDir, { recursive: true });
    await fs.mkdir(thumbnailsDir, { recursive: true });

    // Process with sharp — strip EXIF and get metadata
    const image = sharp(buffer).rotate(); // .rotate() auto-orients based on EXIF before stripping
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Save original with EXIF stripped
    const originalPath = path.join(originalsDir, filename);
    await image.clone().toFile(originalPath);

    // Generate thumbnail (400px wide, maintain aspect ratio)
    const thumbnailFilename = `${fileId}_thumb${ext}`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
    await image
      .clone()
      .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
      .toFile(thumbnailPath);

    // Extract dominant color (resize to 1x1 pixel)
    const dominantPixel = await sharp(buffer)
      .resize(1, 1, { fit: 'cover' })
      .raw()
      .toBuffer();
    const dominantColor = rgbToHex(dominantPixel[0], dominantPixel[1], dominantPixel[2]);

    // Extract 5-color palette (resize to 5x1 pixels)
    const palettePixels = await sharp(buffer)
      .resize(5, 1, { fit: 'cover' })
      .raw()
      .toBuffer();
    const colorPalette: string[] = [];
    for (let i = 0; i < 5; i++) {
      const offset = i * 3;
      colorPalette.push(
        rgbToHex(palettePixels[offset], palettePixels[offset + 1], palettePixels[offset + 2])
      );
    }

    // Get saved file size
    const savedStat = await fs.stat(originalPath);

    return NextResponse.json({
      imagePath: `/uploads/originals/${filename}`,
      thumbnailPath: `/uploads/thumbnails/${thumbnailFilename}`,
      width,
      height,
      dominantColor,
      colorPalette,
      fileSizeBytes: savedStat.size,
    });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
