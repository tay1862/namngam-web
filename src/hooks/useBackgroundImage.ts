import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

interface BackgroundSettings {
  homeBg?: string;
  aboutBg?: string;
  productsBg?: string;
  articlesBg?: string;
}

export function useBackgroundImage(type: keyof BackgroundSettings) {
  const [backgroundImage, setBackgroundImage] = useState('');
  const locale = useLocale();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public/settings');
        const data = await res.json();
        if (data.success) {
          setBackgroundImage(data.data[type] || '');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [type, locale]);

  return backgroundImage;
}