'use client';

import { useLoading } from '@/lib/loading-context';
import { FullPageLoader } from '@/components/shared/Loading';

export default function GlobalLoader() {
  const { isLoading, loadingMessage } = useLoading();
  
  if (isLoading) {
    return <FullPageLoader message={loadingMessage} />;
  }
  
  return null;
}