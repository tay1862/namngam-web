'use client';

import { useCallback } from 'react';
import { useLoading } from '@/lib/loading-context';

export function useGlobalLoading() {
  const { setLoading, setLoadingMessage } = useLoading();

  const showLoading = useCallback((message?: string) => {
    if (message) {
      setLoadingMessage(message);
    }
    setLoading(true);
  }, [setLoading, setLoadingMessage]);

  const hideLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage('');
  }, [setLoading, setLoadingMessage]);

  return {
    showLoading,
    hideLoading,
  };
}