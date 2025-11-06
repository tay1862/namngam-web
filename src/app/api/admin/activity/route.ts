// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatErrorResponse, AuthenticationError, logError } from '@/lib/error-handler';
import { createPaginationOptions, formatPaginationResponse } from '@/lib/performance';

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'login' | 'logout';
  resource: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: string;
  metadata?: any;
}

// GET - Fetch recent activity
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const type = searchParams.get('type') as string || undefined;

    const pagination = createPaginationOptions(page, limit);

    // Build where clause
    const where: any = {};
    
    if (type) {
      where.type = type;
    }

    // Since Activity model doesn't exist, return mock data for now
    // In a real implementation, you would create an Activity model in the schema
    const mockActivity: ActivityItem[] = [
      {
        id: '1',
        type: 'login',
        resource: 'Admin Panel',
        description: 'User logged in to admin panel',
        user: {
          id: session.user.id,
          name: session.user.name || 'Admin User',
          email: session.user.email || '',
        },
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'create',
        resource: 'Article',
        description: 'Created new article',
        user: {
          id: session.user.id,
          name: session.user.name || 'Admin User',
          email: session.user.email || '',
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
    ];

    // Filter by type if specified
    const filteredActivity = type
      ? mockActivity.filter(item => item.type === type)
      : mockActivity;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedActivity = filteredActivity.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedActivity,
      pagination: {
        page,
        limit,
        total: filteredActivity.length,
        totalPages: Math.ceil(filteredActivity.length / limit),
      },
    });
  } catch (error: any) {
    logError(error, 'Activity API - GET');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}

// POST - Log activity
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    const body = await request.json();
    const { type, resource, description, metadata } = body;

    // Validate required fields
    if (!type || !resource) {
      return NextResponse.json(
        { success: false, error: 'Type and resource are required' },
        { status: 400 }
      );
    }

    // Since Activity model doesn't exist, just return success
    // In a real implementation, you would create an Activity model in the schema
    const activity = {
      id: Date.now().toString(),
      type,
      resource,
      description: description || '',
      user: {
        id: session.user.id,
        name: session.user.name || 'Admin User',
        email: session.user.email || '',
      },
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error: any) {
    logError(error, 'Activity API - POST');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}