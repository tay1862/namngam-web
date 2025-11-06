import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// GET - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
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

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { images: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update slug if name changed
    let slug = existing.slug;
    if (name_en && name_en !== existing.name_en) {
      slug = slugify(name_en);
      
      const slugConflict = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      });

      if (slugConflict) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Delete old images
    if (images && existing.images.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: params.id },
      });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        slug,
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
        currency,
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
        isPublished,
        isFeatured,
        order,
        publishedAt: isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
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
    console.error('Product update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
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

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
