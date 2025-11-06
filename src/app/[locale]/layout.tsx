import { NextIntlClientProvider } from 'next-intl';
import { getLocalizedContent } from '@/lib/i18n-helpers';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import '../../styles/globals.css';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import StructuredData, { OrganizationStructuredData } from '@/components/seo/StructuredData';

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) notFound();

  const messages = getLocalizedContent({
    en: require(`../../messages/en.json`),
    lo: require(`../../messages/lo.json`),
    th: require(`../../messages/th.json`),
    zh: require(`../../messages/zh.json`),
  }, locale as 'en' | 'lo' | 'th' | 'zh');

  return (
    <html lang={locale}>
      <head>
        <GoogleAnalytics />
        <OrganizationStructuredData 
          data={{
            name: 'NAMNGAM',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3001'}/${locale}`,
            logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3001'}/logo.png`,
            description: 'Premium quality products and beauty items',
            sameAs: [
              process.env.NEXT_PUBLIC_SITE_URL,
            ],
          }} 
        />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
