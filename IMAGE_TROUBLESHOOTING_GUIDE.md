# Image Display Issues - Troubleshooting and Solutions

## Problem Identification

After deployment, images are not displaying properly. This is a common issue with Next.js applications that handle file uploads, especially when using custom upload directories.

## Root Causes

1. **Static File Serving**: Next.js serves static files from the `public` directory, but uploaded files may not be properly accessible
2. **Image Optimization**: Next.js Image component requires specific configuration for external images
3. **Path Resolution**: Image paths may be incorrect in production environment
4. **Nginx Configuration**: Static file serving may not be properly configured

## Solutions

### Solution 1: Fix Next.js Configuration

Update `next.config.js` to properly handle uploaded images:

```javascript
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Add your production domain
    domains: ['localhost', 'yourdomain.com', 'www.yourdomain.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Enable image optimization with proper configuration
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Important: Disable optimization for uploaded images temporarily
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Add static file handling
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
```

### Solution 2: Create Image Serving API Route

Create `src/app/api/uploads/[...path]/route.ts`:

```typescript
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
    const stats = await stat(filePath);
    
    // Determine content type
    const ext = path.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
    };
    
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';
    
    // Read file
    const fileBuffer = await readFile(filePath);
    
    // Create response with proper headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Content-Length', stats.size.toString());
    
    return response;
  } catch (error) {
    console.error('Image serving error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Solution 3: Update Nginx Configuration

Update your Nginx configuration to properly serve uploaded files:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;
    
    # Main application proxy
    location / {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # IMPORTANT: Direct serving of uploaded files
    location /uploads/ {
        alias /var/www/namngam/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        
        # Security for uploaded files
        location ~* \.(php|jsp|asp|sh|py|exe|bat)$ {
            deny all;
        }
        
        # Handle missing images
        try_files $uri $uri/ @fallback;
    }
    
    # Fallback for missing images
    location @fallback {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # File upload handling
    location /api/upload {
        limit_req zone=upload burst=5 nodelay;
        client_max_body_size 10M;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Solution 4: Update Image Components

Update `src/components/ui/OptimizedImage.tsx`:

```typescript
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  unoptimized?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  style,
  unoptimized = true, // Default to unoptimized for uploaded images
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Handle load event
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Handle error event
  const handleError = () => {
    setError(true);
    setIsLoading(false);
    onError?.();
  };

  // Fallback for error state
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={style}
      >
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  // For uploaded images, use unoptimized mode
  const isUploadedImage = src.includes('/uploads/');
  
  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        unoptimized={isUploadedImage || unoptimized}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  );
}
```

### Solution 5: Update Media Library Component

Update the image display in `src/app/admin/media/page.tsx`:

```typescript
// In the grid view section, update the image rendering:
{item.mimeType.startsWith('image/') ? (
  <div className="w-full h-32 relative">
    <img
      src={item.url}
      alt={item.alt_en || item.originalName}
      className="w-full h-32 object-cover"
      onError={(e) => {
        // Fallback for broken images
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder-image.jpg'; // Create a placeholder image
      }}
    />
  </div>
) : (
  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
    <Icon size={32} className="text-gray-400" />
  </div>
)}
```

### Solution 6: Create Placeholder Image

Create a placeholder image at `public/placeholder-image.jpg` or use an SVG:

```typescript
// Create a simple SVG placeholder component
const PlaceholderImage = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="200" fill="#F3F4F6"/>
    <path d="M80 80L120 120M120 80L80 120" stroke="#9CA3AF" strokeWidth="2"/>
    <circle cx="100" cy="100" r="40" stroke="#9CA3AF" strokeWidth="2"/>
  </svg>
);
```

## Implementation Steps

1. **Update Next.js Configuration**: Modify `next.config.js` with the new settings
2. **Create Image API Route**: Add the image serving API route
3. **Update Nginx Configuration**: Modify your Nginx config to serve uploaded files directly
4. **Update Image Components**: Modify the OptimizedImage component
5. **Test Locally**: Ensure images work in development
6. **Deploy Changes**: Push changes to production
7. **Restart Services**: Restart Nginx and your application

## Verification

After implementing these changes:

1. **Check Image URLs**: Ensure image URLs are correct (should be `/uploads/filename.jpg`)
2. **Test Image Loading**: Verify images load properly in the media library
3. **Check Network Tab**: Use browser dev tools to see if images are loading correctly
4. **Verify Nginx Logs**: Check Nginx error logs for any issues
5. **Test File Uploads**: Ensure new uploads work and display correctly

## Common Issues and Fixes

### Issue: Images return 404
**Fix**: Ensure Nginx configuration includes the `/uploads/` location block

### Issue: Images load slowly
**Fix**: Add proper caching headers in Nginx configuration

### Issue: Images appear broken
**Fix**: Check file permissions on the uploads directory

### Issue: New uploads don't display
**Fix**: Ensure the uploads directory has proper write permissions

## Alternative Solutions

If the above solutions don't work, consider:

1. **Use CDN**: Implement a CDN for uploaded images
2. **External Storage**: Use AWS S3 or similar for file storage
3. **Static Generation**: Pre-generate optimized images at build time

## Monitoring

Set up monitoring for image serving:

1. **Log 404 Errors**: Track missing images
2. **Monitor Performance**: Track image load times
3. **Check Disk Space**: Monitor uploads directory size
4. **Error Tracking**: Implement error reporting for image failures

This comprehensive solution should resolve image display issues in your deployed NAMNGAM application.