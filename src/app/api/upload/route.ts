// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage } from '@/lib/upload';
import { prisma } from '@/lib/prisma';
import { validateFileUpload, getClientIP, rateLimit, SECURITY_CONFIG } from '@/lib/security';
import { formatErrorResponse, AuthenticationError, ValidationError, logError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    // Rate limiting for uploads
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`upload:${clientIP}`, 10); // 10 uploads per window
    
    if (!rateLimitResult.success) {
      throw new ValidationError('Too many upload attempts. Please try again later.');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';
    const alt_lo = formData.get('alt_lo') as string;
    const alt_th = formData.get('alt_th') as string;
    const alt_zh = formData.get('alt_zh') as string;
    const alt_en = formData.get('alt_en') as string;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Enhanced file validation
    const fileValidation = validateFileUpload(file, SECURITY_CONFIG.MAX_FILE_SIZE);
    if (!fileValidation.valid) {
      throw new ValidationError(fileValidation.error || 'Invalid file');
    }

    // Sanitize folder name
    const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 50);

    // Upload file
    const uploadedFile = await uploadImage(file, sanitizedFolder);

    // Save to database with sanitized data
    const media = await prisma.media.create({
      data: {
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalName,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
        url: uploadedFile.url,
        path: uploadedFile.path,
        width: uploadedFile.width,
        height: uploadedFile.height,
        folder: sanitizedFolder,
        alt_lo: alt_lo?.substring(0, 500) || null,
        alt_th: alt_th?.substring(0, 500) || null,
        alt_zh: alt_zh?.substring(0, 500) || null,
        alt_en: alt_en?.substring(0, 500) || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: media,
    });
  } catch (error: any) {
    logError(error, 'Upload API - POST');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    // Sanitize folder name
    const sanitizedFolder = folder?.replace(/[^a-zA-Z0-9-_]/g, '') || undefined;

    const where = sanitizedFolder ? { folder: sanitizedFolder } : {};

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: media,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    logError(error, 'Upload API - GET');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}
