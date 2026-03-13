import { db } from '@/db';
import { artworks } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing artwork ID' },
        { status: 400 }
      );
    }

    // Try to find by ID first, then by slug
    const artwork = db
      .select()
      .from(artworks)
      .where(or(eq(artworks.id, id), eq(artworks.slug, id)))
      .get();

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(artwork);
  } catch (error) {
    console.error('GET /api/artworks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artwork' },
      { status: 500 }
    );
  }
}
