import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imagePath } = body as { imagePath: string };

    if (!imagePath) {
      return NextResponse.json(
        { error: 'imagePath is required' },
        { status: 400 }
      );
    }

    // Resolve the image path relative to the public directory
    const absolutePath = path.join(process.cwd(), 'public', imagePath);

    // Verify the file exists
    try {
      await fs.access(absolutePath);
    } catch {
      return NextResponse.json(
        { error: 'Image file not found' },
        { status: 404 }
      );
    }

    const buffer = await fs.readFile(absolutePath);

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
    const palette: string[] = [];
    for (let i = 0; i < 5; i++) {
      const offset = i * 3;
      palette.push(
        rgbToHex(palettePixels[offset], palettePixels[offset + 1], palettePixels[offset + 2])
      );
    }

    return NextResponse.json({ dominantColor, palette });
  } catch (error) {
    console.error('POST /api/colors error:', error);
    return NextResponse.json(
      { error: 'Failed to extract colors' },
      { status: 500 }
    );
  }
}
