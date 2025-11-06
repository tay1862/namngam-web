import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// GET - Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
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
    });

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Article fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title_lo, title_th, title_zh, title_en,
      content_lo, content_th, content_zh, content_en,
      excerpt_lo, excerpt_th, excerpt_zh, excerpt_en,
      featuredImage,
      metaTitle_lo, metaTitle_th, metaTitle_zh, metaTitle_en,
      metaDesc_lo, metaDesc_th, metaDesc_zh, metaDesc_en,
      isPublished,
      isFeatured,
    } = body;

    // Check if article exists
    const existing = await prisma.article.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Update slug if title changed
    let slug = existing.slug;
    if (title_en && title_en !== existing.title_en) {
      slug = slugify(title_en);
      
      const slugConflict = await prisma.article.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      });

      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Update article
    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        slug,
        title_lo,
        title_th,
        title_zh,
        title_en,
        content_lo,
        content_th,
        content_zh,
        content_en,
        excerpt_lo,
        excerpt_th,
        excerpt_zh,
        excerpt_en,
        featuredImage,
        metaTitle_lo,
        metaTitle_th,
        metaTitle_zh,
        metaTitle_en,
        metaDesc_lo,
        metaDesc_th,
        metaDesc_zh,
        metaDesc_en,
        isPublished,
        isFeatured,
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
      include: {
        createdBy: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Article update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.article.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Article delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
