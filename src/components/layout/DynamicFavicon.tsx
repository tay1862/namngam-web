'use client';

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { addCacheBusting } from '@/lib/performance';

interface Settings {
  favicon?: string;
}

export default function DynamicFavicon() {
  const { settings } = useSettings();

  useEffect(() => {
    const faviconUrl = (settings as Settings)?.favicon;
    if (faviconUrl) {
      // Add cache busting to prevent browser caching issues
      const bustingUrl = addCacheBusting(faviconUrl);
      
      // Update existing favicon links
      const existingIcon = document.querySelector('link[rel="icon"]');
      if (existingIcon) {
        existingIcon.setAttribute('href', bustingUrl);
      }

      const existingAppleIcon = document.querySelector('link[rel="apple-touch-icon"]');
      if (existingAppleIcon) {
        existingAppleIcon.setAttribute('href', bustingUrl);
      }

      // Update or create favicon for browsers
      let favicon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'shortcut icon';
        favicon.type = 'image/x-icon';
        document.head.appendChild(favicon);
      }
      favicon.href = bustingUrl;
    }
  }, [settings]);

  return null; // This component doesn't render anything
}