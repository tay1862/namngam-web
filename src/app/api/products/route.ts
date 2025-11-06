import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// GET - List products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured') === 'true';
    const published = searchParams.get('published') !== 'false'; // default true
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (published) {
      where.isPublished = true;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (featured) {
      where.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { order: 'asc' },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
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
      name_lo, name_th, name_zh, name_en,
      description_lo, description_th, description_zh, description_en,
      categoryId,
      price,
      currency,
      sku,
      featuredImage,
      images,
      metaTitle_lo, metaTitle_th, metaTitle_zh, metaTitle_en,
      metaDesc_lo, metaDesc_th, metaDesc_zh, metaDesc_en,
      isPublished,
      isFeatured,
      order,
    } = body;

    // Validate required fields
    if (!name_lo || !name_th || !name_zh || !name_en) {
      return NextResponse.json(
        { success: false, error: 'All language names are required' },
        { status: 400 }
      );
    }

    if (!description_lo || !description_th || !description_zh || !description_en) {
      return NextResponse.json(
        { success: false, error: 'All language descriptions are required' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = slugify(name_en || name_lo);
    
    // Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    let finalSlug = slug;
    if (existing) {
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Get user from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        slug: finalSlug,
        name_lo,
        name_th,
        name_zh,
        name_en,
        description_lo,
        description_th,
        description_zh,
        description_en,
        categoryId,
        price: price ? parseFloat(price) : null,
        currency: currency || 'LAK',
        sku,
        featuredImage,
        metaTitle_lo,
        metaTitle_th,
        metaTitle_zh,
        metaTitle_en,
        metaDesc_lo,
        metaDesc_th,
        metaDesc_zh,
        metaDesc_en,
        isPublished: isPublished ?? false,
        isFeatured: isFeatured ?? false,
        order: order || 0,
        publishedAt: isPublished ? new Date() : null,
        createdById: user.id,
        images: images && images.length > 0 ? {
          create: images.map((img: any, index: number) => ({
            url: img.url,
            alt_lo: img.alt_lo,
            alt_th: img.alt_th,
            alt_zh: img.alt_zh,
            alt_en: img.alt_en,
            order: index,
          })),
        } : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
