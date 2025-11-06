import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Loading({ message }: { message?: string }) {
  const t = useTranslations();
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative">
          <Loader2 size={48} className="animate-spin text-pink-500 mx-auto mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-pink-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-neutral-600 text-lg">{message || t('common.loading')}</p>
      </div>
    </div>
  );
}

export function LoadingPage({ message }: { message?: string }) {
  const t = useTranslations();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="relative mb-6">
          <Loader2 size={64} className="animate-spin text-pink-500 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-neutral-600 text-xl font-medium">{message || t('common.loading')}</p>
        <p className="text-neutral-500 text-sm mt-2">{t('common.pleaseWait')}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div className="relative">
      <Loader2 size={size} className={`animate-spin text-pink-500 ${className}`} />
      <div
        className="absolute inset-0 bg-pink-100 rounded-full animate-pulse"
        style={{
          width: `${size * 0.5}px`,
          height: `${size * 0.5}px`,
          margin: 'auto',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }}
      ></div>
    </div>
  );
}

export function FullPageLoader({ message }: { message?: string }) {
  const t = useTranslations();
  
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-6">
          <Loader2 size={64} className="animate-spin text-pink-500 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-pink-100 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-neutral-600 text-xl font-medium">{message || t('common.loading')}</p>
        <p className="text-neutral-500 text-sm mt-2">{t('common.pleaseWait')}</p>
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-3xl h-64 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}

export function ListLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-200 rounded-full h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
