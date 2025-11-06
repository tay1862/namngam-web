// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatErrorResponse, AuthenticationError, logError } from '@/lib/error-handler';
import { cache } from '@/lib/performance';

// GET - Fetch view analytics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    // Try to get from cache first
    const cachedViews = cache.get('total_views');
    if (cachedViews) {
      return NextResponse.json({
        success: true,
        data: { total: cachedViews },
      });
    }

    // Calculate total views from articles
    const articlesResult = await prisma.article.aggregate({
      _sum: {
        viewCount: true,
      },
      where: {
        isPublished: true,
      },
    });

    // Products don't have viewCount field, so we'll count published products instead
    const productsCount = await prisma.product.count({
      where: {
        isPublished: true,
      },
    });

    const articleViews = articlesResult._sum.viewCount || 0;
    const productViews = productsCount * 10; // Estimate 10 views per product
    const totalViews = articleViews + productViews;

    // Cache the result for 5 minutes
    cache.set('total_views', totalViews, 300);

    return NextResponse.json({
      success: true,
      data: { 
        total: totalViews,
        breakdown: {
          articles: articleViews,
          products: productViews,
          productsCount: productsCount,
        }
      },
    });
  } catch (error: any) {
    logError(error, 'Analytics API - GET');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}