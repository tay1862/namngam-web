import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { metrics } = await request.json();

    if (!metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    // Process each metric
    for (const metric of metrics) {
      try {
        // Store in database (you might want to create a dedicated table for this)
        // For now, we'll log and potentially send to analytics service
        
        console.log('Web Vitals Metric:', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          url: metric.url,
          timestamp: new Date(metric.timestamp).toISOString(),
          userAgent: metric.userAgent,
        });

        // You could also store these in a database table like:
        // await prisma.webVital.create({
        //   data: {
        //     name: metric.name,
        //     value: metric.value,
        //     rating: metric.rating,
        //     delta: metric.delta,
        //     url: metric.url,
        //     userAgent: metric.userAgent,
        //     timestamp: new Date(metric.timestamp),
        //   },
        // });

        // Or send to external analytics service like Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', metric.name, {
            event_category: 'Web Vitals',
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            event_label: metric.rating,
            non_interaction: true,
          });
        }

      } catch (error) {
        console.error('Error processing individual metric:', error);
        // Continue processing other metrics even if one fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Metrics processed successfully',
      count: metrics.length 
    });

  } catch (error) {
    console.error('Error processing Web Vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve metrics for analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // This would typically query your database
    // const metrics = await prisma.webVital.findMany({
    //   orderBy: { timestamp: 'desc' },
    //   take: limit,
    //   skip: offset,
    // });

    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        limit,
        offset,
        total: 0,
      },
    });

  } catch (error) {
    console.error('Error fetching Web Vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}