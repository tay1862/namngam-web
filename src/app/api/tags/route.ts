import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (popular) {
      // Get tags with article count, ordered by popularity
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: {
              articles: {
                where: {
                  article: {
                    isPublished: true,
                  },
                },
              },
            },
          },
        },
        orderBy: {
          articles: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      const formattedTags = tags.map(tag => ({
        ...tag,
        articleCount: tag._count.articles,
      }));

      return NextResponse.json({
        success: true,
        data: formattedTags,
      });
    } else {
      // Get all tags
      const tags = await prisma.tag.findMany({
        orderBy: { name_en: 'asc' },
        take: limit,
      });

      return NextResponse.json({
        success: true,
        data: tags,
      });
    }
  } catch (error) {
    console.error('Tags fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST - Create new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name_lo, name_th, name_zh, name_en } = body;

    // Validate required fields
    if (!name_lo || !name_th || !name_zh || !name_en) {
      return NextResponse.json(
        { success: false, error: 'All language names are required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name_en.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if tag already exists
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [
          { name_lo },
          { name_th },
          { name_zh },
          { name_en },
          { slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Tag already exists' },
        { status: 400 }
      );
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name_lo,
        name_th,
        name_zh,
        name_en,
        slug,
      },
    });

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Tag creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
