'use client';

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

interface WebVitalsTrackerProps {
  enableDebug?: boolean;
}

export default function WebVitalsTracker({ enableDebug = false }: WebVitalsTrackerProps) {
  useEffect(() => {
    // Enable debug mode if requested
    if (enableDebug && typeof window !== 'undefined') {
      localStorage.setItem('debug-web-vitals', 'true');
    }

    // Initialize Web Vitals tracking
    initWebVitals();

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, [enableDebug]);

  // This component doesn't render anything visible
  return null;
}