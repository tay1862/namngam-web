'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getOptimizedImageUrl, addCacheBusting } from '@/lib/performance';

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

  // Check if it's an uploaded image
  const isUploadedImage = src.includes('/uploads/');
  
  // Generate optimized image URL
  const optimizedSrc = unoptimized || isUploadedImage ? src : getOptimizedImageUrl(src, width, height, quality);

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

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
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