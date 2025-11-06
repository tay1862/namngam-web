// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { rateLimit, getClientIP, SECURITY_CONFIG } from '@/lib/security';
import { formatErrorResponse, AuthenticationError, ValidationError, logError } from '@/lib/error-handler';
import { createPaginationOptions, formatPaginationResponse, createOptimizedQuery, cache } from '@/lib/performance';

// GET - List articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') !== 'false';
    const featured = searchParams.get('featured') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    
    // Create cache key
    const cacheKey = `articles:${published}:${featured}:${page}:${limit}`;
    
    // Create optimized query with caching
    const query = () => {
      const where: any = {};
      
      if (published) {
        where.isPublished = true;
      }
      
      if (featured) {
        where.isFeatured = true;
      }

      const pagination = createPaginationOptions(page, limit);

      return Promise.all([
        prisma.article.findMany({
          where,
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
          ...pagination,
        }),
        prisma.article.count({ where }),
      ]);
    };

    const [articles, total] = await createOptimizedQuery(query, cacheKey, 300); // 5 minutes cache

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: formatPaginationResponse(articles, total, page, limit),
    });
  } catch (error: any) {
    logError(error, 'Articles API - GET');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}

// POST - Create article
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    // Rate limiting for article creation
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`article-create:${clientIP}`, 5); // 5 articles per window
    
    if (!rateLimitResult.success) {
      throw new ValidationError('Too many article creation attempts. Please try again later.');
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
      tags,
    } = body;

    // Validate required fields
    if (!title_lo || !title_th || !title_zh || !title_en) {
      throw new ValidationError('All language titles are required');
    }

    // Sanitize and validate inputs
    const sanitizedTitles = {
      lo: title_lo.trim().substring(0, 200),
      th: title_th.trim().substring(0, 200),
      zh: title_zh.trim().substring(0, 200),
      en: title_en.trim().substring(0, 200),
    };

    // Generate slug
    const slug = slugify(sanitizedTitles.en || sanitizedTitles.lo);
    
    // Check slug uniqueness with optimized query
    const existing = await createOptimizedQuery(
      () => prisma.article.findUnique({ where: { slug } }),
      `article-slug:${slug}`,
      60
    );

    let finalSlug = slug;
    if (existing) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Get user with caching
    const user = await createOptimizedQuery(
      () => prisma.user.findUnique({ where: { email: session.user.email } }),
      `user:${session.user.email}`,
      300
    );

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Create article with transaction
    const article = await prisma.$transaction(async (tx: any) => {
      // Clear cache for articles list
      cache.delete('articles:true:false:1:20');
      cache.delete('articles:true:true:1:20');
      
      return tx.article.create({
        data: {
          slug: finalSlug,
          title_lo: sanitizedTitles.lo,
          title_th: sanitizedTitles.th,
          title_zh: sanitizedTitles.zh,
          title_en: sanitizedTitles.en,
          content_lo: content_lo || '',
          content_th: content_th || '',
          content_zh: content_zh || '',
          content_en: content_en || '',
          excerpt_lo: excerpt_lo?.substring(0, 500) || '',
          excerpt_th: excerpt_th?.substring(0, 500) || '',
          excerpt_zh: excerpt_zh?.substring(0, 500) || '',
          excerpt_en: excerpt_en?.substring(0, 500) || '',
          featuredImage,
          metaTitle_lo: metaTitle_lo?.substring(0, 60) || null,
          metaTitle_th: metaTitle_th?.substring(0, 60) || null,
          metaTitle_zh: metaTitle_zh?.substring(0, 60) || null,
          metaTitle_en: metaTitle_en?.substring(0, 60) || null,
          metaDesc_lo: metaDesc_lo?.substring(0, 160) || null,
          metaDesc_th: metaDesc_th?.substring(0, 160) || null,
          metaDesc_zh: metaDesc_zh?.substring(0, 160) || null,
          metaDesc_en: metaDesc_en?.substring(0, 160) || null,
          isPublished: isPublished ?? false,
          isFeatured: isFeatured ?? false,
          publishedAt: isPublished ? new Date() : null,
          createdById: (user as any).id,
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
    });

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error: any) {
    logError(error, 'Articles API - POST');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}
