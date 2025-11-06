// @ts-ignore
import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatErrorResponse, AuthenticationError, ValidationError, logError } from '@/lib/error-handler';
import { cache } from '@/lib/performance';

// GET - Fetch settings
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    // Try to get from cache first
    const cachedSettings = cache.get('site_settings');
    if (cachedSettings) {
      return NextResponse.json({
        success: true,
        data: cachedSettings,
      });
    }

    // Fetch from database
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'site_settings' },
    });

    if (!settings) {
      // Create default settings if not found
      const defaultSettings = await prisma.siteSettings.create({
        data: { id: 'site_settings' },
      });
      
      cache.set('site_settings', defaultSettings, 300); // 5 minutes cache
      return NextResponse.json({
        success: true,
        data: defaultSettings,
      });
    }

    cache.set('site_settings', settings, 300); // 5 minutes cache
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    logError(error, 'Settings API - GET');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }

    const body = await request.json();
    
    // Validate input
    if (!body || typeof body !== 'object') {
      throw new ValidationError('Invalid request body');
    }

    // Sanitize and validate each field
    const sanitizedData: any = {};
    const allowedFields = [
      'siteName_lo', 'siteName_th', 'siteName_zh', 'siteName_en',
      'logo', 'favicon', 'homeBg', 'aboutBg', 'productsBg', 'articlesBg',
      'heroWelcome_lo', 'heroWelcome_th', 'heroWelcome_zh', 'heroWelcome_en',
      'heroTitle_lo', 'heroTitle_th', 'heroTitle_zh', 'heroTitle_en',
      'heroSubtitle_lo', 'heroSubtitle_th', 'heroSubtitle_zh', 'heroSubtitle_en',
      'heroBadgeImage', 'heroBadgeText_lo', 'heroBadgeText_th', 'heroBadgeText_zh', 'heroBadgeText_en',
      'heroDesignImage',
      'email', 'phone',
      'address_lo', 'address_th', 'address_zh', 'address_en',
      'whatsapp', 'whatsappMessage_lo', 'whatsappMessage_th', 'whatsappMessage_zh', 'whatsappMessage_en',
      'facebookPage', 'lineId',
      'defaultMetaDesc_lo', 'defaultMetaDesc_th', 'defaultMetaDesc_zh', 'defaultMetaDesc_en',
      'googleAnalyticsId', 'facebookPixelId',
      'isUnderMaintenance',
      'maintenanceMessage_lo', 'maintenanceMessage_th', 'maintenanceMessage_zh', 'maintenanceMessage_en'
    ];

    // Define which fields are boolean vs string
    const booleanFields = ['isUnderMaintenance'];
    const stringFields = allowedFields.filter(field => !booleanFields.includes(field));
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (booleanFields.includes(field)) {
          // Handle boolean fields
          sanitizedData[field] = Boolean(body[field]);
        } else {
          // Handle string fields (including optional ones)
          if (body[field] === null || body[field] === '' || body[field] === false) {
            // Set to null for empty values to match Prisma schema
            sanitizedData[field] = null;
          } else if (typeof body[field] === 'string') {
            // Limit length and remove potentially harmful content
            sanitizedData[field] = body[field]
              .replace(/<script\b[^<]*(?:(?!<\/script>))*[^<]*<\/script>/gi, '')
              .substring(0, field.includes('Url') || field.includes('Id') ? 500 : 2000);
          } else {
            // Convert to string if it's not already
            sanitizedData[field] = String(body[field]);
          }
        }
      }
    }

    // Update settings with transaction
    const updatedSettings = await prisma.$transaction(async (tx: any) => {
      const settings = await tx.siteSettings.update({
        where: { id: 'site_settings' },
        data: sanitizedData,
      });

      // Clear both admin and public cache
      cache.delete('site_settings');
      cache.delete('public_site_settings');
      
      return settings;
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
    });
  } catch (error: any) {
    logError(error, 'Settings API - PUT');
    return NextResponse.json(
      formatErrorResponse(error),
      { status: error.statusCode || 500 }
    );
  }
}
