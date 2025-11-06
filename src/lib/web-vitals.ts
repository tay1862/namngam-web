import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

// Extended Web Vitals interface for tracking
interface WebVitalsData {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

// Custom metric interface for additional metrics
interface CustomMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: number;
  entries?: PerformanceEntry[];
}

// Store metrics for batch sending
let metricsBuffer: WebVitalsData[] = [];
let isSending = false;

// Configuration
const config = {
  endpoint: '/api/analytics/web-vitals',
  batchSize: 10,
  maxWaitTime: 5000, // 5 seconds
  retryAttempts: 3,
  retryDelay: 1000,
};

// Send metrics to the server
async function sendMetrics(metrics: WebVitalsData[], retryCount = 0): Promise<void> {
  if (isSending) return;
  
  isSending = true;
  
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metrics }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Clear buffer on successful send
    metricsBuffer = metricsBuffer.filter(m => !metrics.includes(m));
  } catch (error) {
    console.error('Failed to send Web Vitals metrics:', error);
    
    // Retry logic
    if (retryCount < config.retryAttempts) {
      setTimeout(() => {
        sendMetrics(metrics, retryCount + 1);
      }, config.retryDelay * (retryCount + 1));
    }
  } finally {
    isSending = false;
  }
}

// Process and queue metrics
function processMetric(metric: Metric): void {
  // Only process in production or if explicitly enabled
  if (typeof window !== 'undefined' && 
      (process.env.NODE_ENV === 'production' || 
       localStorage.getItem('debug-web-vitals') === 'true')) {
    
    const webVitalsData: WebVitalsData = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: metric.rating as 'good' | 'needs-improvement' | 'poor',
      delta: metric.delta,
      navigationType: (performance as any)?.navigation?.type?.toString() || 'unknown',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Add to buffer
    metricsBuffer.push(webVitalsData);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vital:', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
      });
    }

    // Send immediately if buffer is full or wait for batch
    if (metricsBuffer.length >= config.batchSize) {
      sendMetrics([...metricsBuffer]);
    } else {
      // Set timeout to send remaining metrics
      setTimeout(() => {
        if (metricsBuffer.length > 0) {
          sendMetrics([...metricsBuffer]);
        }
      }, config.maxWaitTime);
    }
  }
}

// Initialize Web Vitals tracking
export function initWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  onCLS(processMetric);
  onINP(processMetric);
  onFCP(processMetric);
  onLCP(processMetric);
  onTTFB(processMetric);

  // Additional metrics
  if ('PerformanceObserver' in window) {
    // Long Tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Long task threshold
            const customMetric: CustomMetric = {
              id: `long-task-${Date.now()}`,
              name: 'long-task',
              value: entry.duration,
              rating: entry.duration > 200 ? 'poor' : 'needs-improvement',
              delta: entry.duration,
              navigationType: (performance as any)?.navigation?.type || 0,
            };
            processMetric(customMetric as unknown as Metric);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long Task observer not supported');
    }

    // Cumulative Layout Shift (CLS) breakdown
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            const customMetric: CustomMetric = {
              id: `cls-breakdown-${Date.now()}`,
              name: 'cls-breakdown',
              value: layoutShiftEntry.value,
              rating: layoutShiftEntry.value > 0.25 ? 'poor' : layoutShiftEntry.value > 0.1 ? 'needs-improvement' : 'good',
              delta: layoutShiftEntry.value,
              navigationType: (performance as any)?.navigation?.type || 0,
            };
            processMetric(customMetric as unknown as Metric);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS breakdown observer not supported');
    }
  }

  // Page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && metricsBuffer.length > 0) {
      // Send any pending metrics when page is hidden
      sendMetrics([...metricsBuffer]);
    }
  });

  // Send metrics before page unload
  window.addEventListener('beforeunload', () => {
    if (metricsBuffer.length > 0) {
      // Use sendBeacon for reliable delivery during page unload
      const data = JSON.stringify({ metrics: metricsBuffer });
      navigator.sendBeacon(config.endpoint, data);
    }
  });
}

// Get current metrics for debugging
export function getCurrentMetrics(): WebVitalsData[] {
  return [...metricsBuffer];
}

// Clear metrics buffer
export function clearMetrics(): void {
  metricsBuffer = [];
}

// Performance thresholds for reference
export const thresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

// Utility function to check if a metric meets the "good" threshold
export function isGoodMetric(name: string, value: number): boolean {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return false;
  return value <= threshold.good;
}

// Utility function to get performance rating
export function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'poor';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}