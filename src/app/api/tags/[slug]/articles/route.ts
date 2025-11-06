import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get articles by tag slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Find the tag
    const tag = await prisma.tag.findUnique({
      where: { slug: params.slug },
    });

    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Get articles by tag
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          tags: {
            some: {
              tagId: tag.id,
            },
          },
          isPublished: true,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.article.count({
        where: {
          tags: {
            some: {
              tagId: tag.id,
            },
          },
          isPublished: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tag,
        articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Tag articles fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles by tag' },
      { status: 500 }
    );
  }
}
