import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { PageStructuredData } from '@/components/seo/StructuredData';
import Head from 'next/head';

export default function NotFound() {
  const t = useTranslations('error');

  const breadcrumbs = [
    { name: t('home'), url: '/' },
    { name: t('notFound'), url: '/404' },
  ];

  return (
    <>
      <Head>
        <title>{t('notFound')} | NAMNGAM</title>
        <meta name="description" content={t('notFoundDescription')} />
        <meta property="og:title" content={t('notFound')} />
        <meta property="og:description" content={t('notFoundDescription')} />
        <meta property="og:url" content={`${process.env.NEXTAUTH_URL}/404`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('notFound')} />
        <meta name="twitter:description" content={t('notFoundDescription')} />
        
        {/* Structured Data */}
        <PageStructuredData 
          title={t('notFound')}
          description={t('notFoundDescription')}
          breadcrumbs={breadcrumbs}
        />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50">
        <div className="container-custom text-center max-w-2xl mx-auto px-6">
          {/* 404 Illustration */}
          <div className="relative mb-12">
            <div className="text-9xl font-bold text-pink-200 mb-4">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🔍</div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-gray-800">
            {t('pageNotFound')}
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            {t('pageNotFoundDescription')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto group">
                <Home size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                {t('goHome')}
              </Button>
            </Link>
            
            <Link href="/products">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto group">
                <Search size={20} className="mr-2 group-hover:scale-110 transition-transform" />
                {t('browseProducts')}
              </Button>
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-16 p-8 bg-white rounded-2xl shadow-lg border border-pink-100">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {t('lookingFor')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <Link 
                href="/products" 
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-pink-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  🛍️
                </div>
                <div>
                  <div className="font-medium text-gray-800">{t('ourProducts')}</div>
                  <div className="text-sm text-gray-600">{t('browseOurCollection')}</div>
                </div>
              </Link>
              
              <Link 
                href="/articles" 
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-pink-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  📝
                </div>
                <div>
                  <div className="font-medium text-gray-800">{t('latestArticles')}</div>
                  <div className="text-sm text-gray-600">{t('readOurBlog')}</div>
                </div>
              </Link>
              
              <Link 
                href="/about" 
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-pink-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  ℹ️
                </div>
                <div>
                  <div className="font-medium text-gray-800">{t('aboutUs')}</div>
                  <div className="text-sm text-gray-600">{t('learnMoreAboutUs')}</div>
                </div>
              </Link>
              
              <Link 
                href="/contact" 
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-pink-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                  📞
                </div>
                <div>
                  <div className="font-medium text-gray-800">{t('contactUs')}</div>
                  <div className="text-sm text-gray-600">{t('getInTouch')}</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <ArrowLeft size={20} />
              {t('goBack')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}