'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Home, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { PageStructuredData } from '@/components/seo/StructuredData';
import Head from 'next/head';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  const t = useTranslations('error');

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
    
    // You could also send to an error tracking service like Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }, [error]);

  const breadcrumbs = [
    { name: t('home'), url: '/' },
    { name: t('serverError'), url: '/500' },
  ];

  return (
    <>
      <Head>
        <title>{t('serverError')} | NAMNGAM</title>
        <meta name="description" content={t('serverErrorDescription')} />
        <meta property="og:title" content={t('serverError')} />
        <meta property="og:description" content={t('serverErrorDescription')} />
        <meta property="og:url" content={`${process.env.NEXTAUTH_URL}/500`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('serverError')} />
        <meta name="twitter:description" content={t('serverErrorDescription')} />
        
        {/* Structured Data */}
        <PageStructuredData 
          title={t('serverError')}
          description={t('serverErrorDescription')}
          breadcrumbs={breadcrumbs}
        />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="container-custom text-center max-w-2xl mx-auto px-6">
          {/* Error Illustration */}
          <div className="relative mb-12">
            <div className="text-9xl font-bold text-red-200 mb-4">500</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle size={80} className="text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-gray-800">
            {t('somethingWentWrong')}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {t('serverErrorDescription')}
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="font-semibold text-red-800 mb-2">Error Details (Development):</h3>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={reset}
              size="lg" 
              className="w-full sm:w-auto group"
            >
              <RefreshCw size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
              {t('tryAgain')}
            </Button>
            
            <Link href="/">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto group">
                <Home size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                {t('goHome')}
              </Button>
            </Link>
          </div>

          {/* Helpful Information */}
          <div className="p-8 bg-white rounded-2xl shadow-lg border border-red-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {t('whatYouCanDo')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">{t('refreshPage')}</div>
                  <div className="text-sm text-gray-600">{t('refreshPageDescription')}</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ArrowLeft size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">{t('goBack')}</div>
                  <div className="text-sm text-gray-600">{t('goBackDescription')}</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  🕐
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">{t('tryLater')}</div>
                  <div className="text-sm text-gray-600">{t('tryLaterDescription')}</div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  📞
                </div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">{t('contactSupport')}</div>
                  <div className="text-sm text-gray-600">{t('contactSupportDescription')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Error */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              {t('errorPersisting')}
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              {t('reportError')}
              <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}