import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.fAQCategory.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            faqs: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('FAQ categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name_lo,
      name_th,
      name_zh,
      name_en,
      description_lo,
      description_th,
      description_zh,
      description_en,
      order = 0,
      isActive = true,
    } = body;

    const category = await prisma.fAQCategory.create({
      data: {
        name_lo,
        name_th,
        name_zh,
        name_en,
        description_lo,
        description_th,
        description_zh,
        description_en,
        order,
        isActive,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('FAQ category creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ category' },
      { status: 500 }
    );
  }
}
