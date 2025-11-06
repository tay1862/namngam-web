import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const active = searchParams.get('active') !== 'false';
    const limit = searchParams.get('limit');
    const locale = searchParams.get('locale');

    const where: any = {
      isActive: active,
    };

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }

    let faqsQuery: any = {
      where,
      include: {
        category: {
          select: {
            id: true,
            name_lo: true,
            name_th: true,
            name_zh: true,
            name_en: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    };

    if (limit) {
      faqsQuery.take = parseInt(limit);
    }

    const faqs = await prisma.fAQ.findMany(faqsQuery);

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('FAQ fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question_lo,
      question_th,
      question_zh,
      question_en,
      answer_lo,
      answer_th,
      answer_zh,
      answer_en,
      categoryId,
      order = 0,
      isActive = true,
    } = body;

    const faq = await prisma.fAQ.create({
      data: {
        question_lo,
        question_th,
        question_zh,
        question_en,
        answer_lo,
        answer_th,
        answer_zh,
        answer_en,
        categoryId: categoryId || null,
        order,
        isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error('FAQ creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}
