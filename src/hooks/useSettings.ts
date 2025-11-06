import { useState, useEffect } from 'react';

interface Settings {
  id?: string;
  siteName_lo: string;
  siteName_th: string;
  siteName_zh: string;
  siteName_en: string;
  defaultMetaDesc_lo: string;
  defaultMetaDesc_th: string;
  defaultMetaDesc_zh: string;
  defaultMetaDesc_en: string;
  email: string;
  phone: string;
  address_lo: string;
  address_th: string;
  address_zh: string;
  address_en: string;
  facebookPage: string;
  lineId: string;
  whatsapp: string;
  logo: string;
  favicon: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UseSettingsReturn {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/public/settings');
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Failed to fetch settings');
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}
