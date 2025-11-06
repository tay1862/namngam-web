'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeroSection from '@/components/home/HeroSection';
import HeroAboutTransition from '@/components/home/HeroAboutTransition';
import AboutContent from '@/components/AboutContent';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LatestArticles from '@/components/home/LatestArticles';
import FAQSection from '@/components/home/FAQSection';

export default function HomePage({ params }: { params: { locale: string } }) {
  const pathname = usePathname();
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    setIsAdminPage(pathname.includes('/admin'));
  }, [pathname]);
  
  return (
    <div>
      <HeroSection />
      <HeroAboutTransition />
      <AboutContent locale={params.locale} />
      <FeaturedProducts />
      <LatestArticles />
      <FAQSection locale={params.locale} />
    </div>
  );
}
