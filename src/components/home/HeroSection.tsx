'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addCacheBusting } from '@/lib/performance';

export default function HeroSection() {
  const t = useTranslations();
  const locale = useLocale();
  const [homeBg, setHomeBg] = useState('');
  const [heroWelcome, setHeroWelcome] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroBadgeImage, setHeroBadgeImage] = useState('');
  const [heroBadgeText, setHeroBadgeText] = useState('');
  const [heroDesignImage, setHeroDesignImage] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/public/settings');
        const data = await res.json();
        if (data.success) {
          setHomeBg(data.data.homeBg ? addCacheBusting(data.data.homeBg) : '');
          setHeroWelcome(data.data[`heroWelcome_${locale}`] || t('home.welcome'));
          setHeroTitle(data.data[`heroTitle_${locale}`] || t('home.hero.title'));
          setHeroSubtitle(data.data[`heroSubtitle_${locale}`] || t('home.hero.subtitle'));
          setHeroBadgeImage(data.data.heroBadgeImage ? addCacheBusting(data.data.heroBadgeImage) : '');
          setHeroBadgeText(data.data[`heroBadgeText_${locale}`] || 'Available Now');
          setHeroDesignImage(data.data.heroDesignImage ? addCacheBusting(data.data.heroDesignImage) : '');
          setLogo(data.data.logo ? addCacheBusting(data.data.logo) : '');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, [locale, t]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pb-0">
      {/* Background Image */}
      {homeBg && (
        <>
          <div className="absolute inset-0">
            <Image
              src={homeBg}
              alt="Background"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ filter: 'brightness(0.6)' }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </>
      )}
      
      {/* Fallback gradient background */}
      {!homeBg && <div className="absolute inset-0 soft-gradient-bg"></div>}
      
      {/* Decorative geometric elements */}
      <div className="absolute top-20 right-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blush rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-150 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse"></div>
      
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(217, 49, 147, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(245, 196, 224, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 20%, rgba(225, 91, 169, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>
      
      <div className="container-custom py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-8 px-8 py-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-pink-100"
            >
              <span className="text-pink-600 font-medium">{heroWelcome} NAMNGAM</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold mb-8 leading-tight">
              <span className="gradient-text">
                {heroTitle}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {heroSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="w-full sm:w-auto group">
                  {t('product.allProducts')}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={`/${locale}/about`}>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t('nav.about')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 max-w-lg mx-auto lg:mx-0"
            >
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-pink-500">100+</div>
                <div className="text-sm text-neutral-600 mt-1">{t('home.products')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-pink-500">1K+</div>
                <div className="text-sm text-neutral-600 mt-1">{t('home.customers')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-pink-500">4.9</div>
                <div className="text-sm text-neutral-600 mt-1">{t('home.rating')}</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main geometric design container */}
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 shadow-2xl shadow-pink-500/30 overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-700">
                {heroDesignImage ? (
                  // Show uploaded image
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <Image
                      src={heroDesignImage}
                      alt="NAMNGAM"
                      fill
                      className="object-cover rounded-2xl"
                    />
                  </div>
                ) : logo ? (
                  // Show logo if no hero design image
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-3/4 h-3/4 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                      <div className="text-center text-white">
                        <div className="relative mb-8">
                          <div className="w-32 h-32 mx-auto relative">
                            <Image
                              src={logo}
                              alt="NAMNGAM"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                        <p className="text-4xl font-bold tracking-wider mb-4">NAMNGAM</p>
                        <p className="text-xl opacity-90 px-4">{heroSubtitle}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show original geometric design
                  <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="w-3/4 h-3/4 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                      <div className="text-center text-white">
                        {/* Elegant geometric design instead of emoji */}
                        <div className="relative mb-8">
                          <div className="w-32 h-32 mx-auto relative">
                            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                            <div className="absolute inset-4 bg-white/30 rounded-full animate-pulse delay-75"></div>
                            <div className="absolute inset-8 bg-white/40 rounded-full animate-pulse delay-150"></div>
                          </div>
                        </div>
                        <p className="text-4xl font-bold tracking-wider mb-4">NAMNGAM</p>
                        <p className="text-xl opacity-90 px-4">{heroSubtitle}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating elegant badges */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-8 -right-8 bg-white rounded-3xl shadow-xl p-6 border border-neutral-100 flex items-center gap-3"
              >
                {heroBadgeImage ? (
                  <Image
                    src={heroBadgeImage}
                    alt="Hero Badge"
                    width={32}
                    height={32}
                    className="object-contain rounded"
                  />
                ) : (
                  <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                )}
                <span className="text-sm font-medium text-neutral-700">{heroBadgeText}</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-8 -left-8 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-3xl shadow-xl p-6"
              >
                <div className="text-3xl font-bold mb-1">4.9</div>
                <div className="text-xs opacity-90">{t('home.customerRating')}</div>
              </motion.div>

              {/* Additional geometric decorations */}
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-8 -left-8 w-16 h-16 border-4 border-pink-200 rounded-full opacity-60"
              />
              <motion.div
                animate={{ rotate: [360, 0, 360] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-4 right-12 w-12 h-12 border-4 border-blush rounded-full opacity-40"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
