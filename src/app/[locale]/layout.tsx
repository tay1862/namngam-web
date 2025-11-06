import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import { locales } from '@/i18n';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import QuickLinks from '@/components/layout/QuickLinks';
import DynamicFavicon from '@/components/layout/DynamicFavicon';
import { LoadingProvider } from '@/lib/loading-context';
import GlobalLoader from '@/components/layout/GlobalLoader';
import WebVitalsTracker from '@/components/analytics/WebVitalsTracker';
import AccessibilityInitializer from '@/components/accessibility/AccessibilityInitializer';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale === 'lo' ? 'lo-LA' : locale}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <DynamicFavicon />
      </head>
      <body>
        <LoadingProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <WebVitalsTracker enableDebug={process.env.NODE_ENV === 'development'} />
            <AccessibilityInitializer />
            <Navbar />
            <main id="main-content" className="min-h-screen" role="main">{children}</main>
            <Footer />
            <QuickLinks />
            <GlobalLoader />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#171717',
                  borderRadius: '12px',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </NextIntlClientProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
