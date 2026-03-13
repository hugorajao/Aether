import { db } from '@/db';
import { artworks } from '@/db/schema';
import { eq, like, or, desc, asc, and, sql, lt, gt } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const cursor = searchParams.get('cursor');
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const limitParam = searchParams.get('limit');

    const limit = Math.min(Math.max(parseInt(limitParam || '24', 10) || 24, 1), 100);

    // Build filter conditions
    const conditions: ReturnType<typeof eq>[] = [];

    if (filter === 'generative') {
      conditions.push(eq(artworks.type, 'generative'));
    } else if (filter === 'community') {
      conditions.push(eq(artworks.type, 'community'));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(artworks.title, searchPattern),
          like(artworks.artistName, searchPattern),
          like(artworks.tags, searchPattern)
        )!
      );
    }

    if (tag) {
      conditions.push(like(artworks.tags, `%${tag}%`));
    }

    // Cursor-based pagination
    if (cursor) {
      if (sort === 'oldest') {
        conditions.push(gt(artworks.id, cursor));
      } else if (sort === 'title') {
        // For title sort, we need to compare by title then id
        const cursorArtwork = db
          .select({ title: artworks.title })
          .from(artworks)
          .where(eq(artworks.id, cursor))
          .get();

        if (cursorArtwork) {
          conditions.push(
            or(
              gt(artworks.title, cursorArtwork.title),
              and(eq(artworks.title, cursorArtwork.title), gt(artworks.id, cursor))
            )!
          );
        }
      } else {
        // newest (default) — descending by createdAt
        conditions.push(lt(artworks.id, cursor));
      }
    }

    // Determine sort order
    const orderBy = sort === 'oldest'
      ? [asc(artworks.createdAt), asc(artworks.id)]
      : sort === 'title'
        ? [asc(artworks.title), asc(artworks.id)]
        : [desc(artworks.createdAt), desc(artworks.id)];

    // Get total count with the same filters (excluding cursor)
    const countConditions: ReturnType<typeof eq>[] = [];
    if (filter === 'generative') {
      countConditions.push(eq(artworks.type, 'generative'));
    } else if (filter === 'community') {
      countConditions.push(eq(artworks.type, 'community'));
    }
    if (search) {
      const searchPattern = `%${search}%`;
      countConditions.push(
        or(
          like(artworks.title, searchPattern),
          like(artworks.artistName, searchPattern),
          like(artworks.tags, searchPattern)
        )!
      );
    }
    if (tag) {
      countConditions.push(like(artworks.tags, `%${tag}%`));
    }

    const totalResult = db
      .select({ count: sql<number>`count(*)` })
      .from(artworks)
      .where(countConditions.length > 0 ? and(...countConditions) : undefined)
      .get();

    const total = totalResult?.count ?? 0;

    // Fetch artworks with one extra to determine if there's a next page
    const results = db
      .select()
      .from(artworks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(...orderBy)
      .limit(limit + 1)
      .all();

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      artworks: items,
      nextCursor,
      total,
    });
  } catch (error) {
    console.error('GET /api/artworks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      artistName,
      artistStatement,
      description,
      type,
      medium,
      aiTool,
      prompt,
      tags,
      imagePath,
      thumbnailPath,
      width,
      height,
      dominantColor,
      colorPalette,
      aspectRatio,
      fileSizeBytes,
      generativeConfig,
      exhibitionId,
      exhibitionOrder,
      featured,
    } = body;

    if (!title || !artistName || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, artistName, type' },
        { status: 400 }
      );
    }

    if (type !== 'generative' && type !== 'community') {
      return NextResponse.json(
        { error: 'Type must be "generative" or "community"' },
        { status: 400 }
      );
    }

    // Generate slug with collision handling
    let slug = slugify(title);
    const existing = db
      .select({ id: artworks.id })
      .from(artworks)
      .where(eq(artworks.slug, slug))
      .get();

    if (existing) {
      slug = `${slug}-${nanoid(6)}`;
    }

    const now = new Date().toISOString();
    const id = nanoid();

    const newArtwork = {
      id,
      slug,
      title,
      artistName,
      artistStatement: artistStatement || null,
      description: description || null,
      type: type as 'generative' | 'community',
      medium: medium || null,
      aiTool: aiTool || null,
      prompt: prompt || null,
      tags: tags || null,
      imagePath: imagePath || null,
      thumbnailPath: thumbnailPath || null,
      width: width || null,
      height: height || null,
      dominantColor: dominantColor || null,
      colorPalette: colorPalette || null,
      aspectRatio: aspectRatio || null,
      fileSizeBytes: fileSizeBytes || null,
      generativeConfig: generativeConfig || null,
      exhibitionId: exhibitionId || null,
      exhibitionOrder: exhibitionOrder || null,
      featured: featured || false,
      createdAt: now,
      updatedAt: now,
    };

    db.insert(artworks).values(newArtwork).run();

    const created = db
      .select()
      .from(artworks)
      .where(eq(artworks.id, id))
      .get();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/artworks error:', error);
    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    );
  }
}
