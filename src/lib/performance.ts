// Performance optimization utilities for NAMNGAM

// Simple in-memory cache (in production, use Redis)
class SimpleCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  
  set(key: string, data: any, ttlSeconds: number = 300) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }
  
  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Clean up cache every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

// Database query optimization
export function createOptimizedQuery<T>(
  query: () => Promise<T>,
  cacheKey: string,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }
  
  // If not in cache, execute query
  return query().then(result => {
    cache.set(cacheKey, result, ttlSeconds);
    return result;
  });
}

// Pagination helper
export function createPaginationOptions(page: number, limit: number = 20) {
  const skip = (page - 1) * limit;
  return {
    skip: skip < 0 ? 0 : skip,
    take: limit > 100 ? 100 : limit, // Max 100 items per page
  };
}

// Format pagination response
export function formatPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Image optimization helper
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 85,
  bustCache: boolean = false
): string {
  if (!url) return '';
  
  // If it's an external URL, return as is
  if (url.startsWith('http')) return url;
  
  // For local images, we can add optimization parameters
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 85) params.set('q', quality.toString());
  
  // Add cache busting parameter if requested
  if (bustCache) {
    params.set('t', Date.now().toString());
  }
  
  const paramString = params.toString();
  return paramString ? `${url}?${paramString}` : url;
}

// Cache busting helper for dynamic images
export function addCacheBusting(url: string): string {
  if (!url) return '';
  
  // If it's an external URL, return as is
  if (url.startsWith('http')) return url;
  
  // Add timestamp as query parameter for cache busting
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

// Lazy loading helper for images
export function createImageObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.01,
  });
}

// Bundle size optimization
export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load script on server'));
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  }
}

// Critical resource preloading
export function preloadResource(url: string, as: string = 'script') {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

// Service worker registration
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Web Vitals monitoring
export function reportWebVitals(metric: any) {
  // In production, send to analytics service
  // @ts-ignore
  if (process?.env?.NODE_ENV === 'production') {
    // Example: send to Google Analytics, Vercel Analytics, etc.
    console.log('Web Vital:', metric);
  }
}

// Memory usage monitoring (development only)
export function logMemoryUsage() {
  // @ts-ignore
  if (typeof window === 'undefined' && process?.env?.NODE_ENV === 'development') {
    // @ts-ignore
    const used = process.memoryUsage();
    console.log('Memory Usage:', {
      rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(used.external / 1024 / 1024 * 100) / 100,
    });
  }
}