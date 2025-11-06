import { getTranslations } from 'next-intl/server';
import AboutContent from '@/components/AboutContent';

export const dynamic = 'force-dynamic';

interface AboutPageProps {
  params: {
    locale: string;
  };
}

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  const t = await getTranslations({ locale, namespace: 'about' });

  return (
    <AboutContent locale={locale} />
  );
}
