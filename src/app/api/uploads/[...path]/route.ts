import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const filePath = join(process.cwd(), 'public', 'uploads', path);
    
    // Security check: ensure file exists and is within uploads directory
    if (!existsSync(filePath) || !filePath.includes('uploads')) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Get file stats
    const fileStats = await stat(filePath);
    
    // Determine content type
    const ext = path.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'avif': 'image/avif',
    };
    
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';
    
    // Read file
    const fileBuffer = await readFile(filePath);
    
    // Create response with proper headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Content-Length', fileStats.size.toString());
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;
  } catch (error) {
    console.error('Image serving error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}