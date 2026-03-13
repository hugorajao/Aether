import { db } from '@/db';
import { exhibitions, artworks } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const results = db
      .select({
        id: exhibitions.id,
        slug: exhibitions.slug,
        title: exhibitions.title,
        subtitle: exhibitions.subtitle,
        curatorNote: exhibitions.curatorNote,
        coverImagePath: exhibitions.coverImagePath,
        themeColor: exhibitions.themeColor,
        createdAt: exhibitions.createdAt,
        updatedAt: exhibitions.updatedAt,
        artworkCount: sql<number>`count(${artworks.id})`,
      })
      .from(exhibitions)
      .leftJoin(artworks, eq(artworks.exhibitionId, exhibitions.id))
      .groupBy(exhibitions.id)
      .orderBy(exhibitions.createdAt)
      .all();

    return NextResponse.json({ exhibitions: results });
  } catch (error) {
    console.error('GET /api/exhibitions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exhibitions' },
      { status: 500 }
    );
  }
}
