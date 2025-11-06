'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loading } from '@/components/shared/Loading';

interface AboutValue {
  id: string;
  icon: string;
  title_lo: string;
  title_th: string;
  title_zh: string;
  title_en: string;
  description_lo?: string;
  description_th?: string;
  description_zh?: string;
  description_en?: string;
  order: number;
}

interface AboutPageData {
  id: string;
  title_lo: string;
  title_th: string;
  title_zh: string;
  title_en: string;
  storyTitle_lo: string;
  storyTitle_th: string;
  storyTitle_zh: string;
  storyTitle_en: string;
  storyParagraph1_lo?: string;
  storyParagraph1_th?: string;
  storyParagraph1_zh?: string;
  storyParagraph1_en?: string;
  storyParagraph2_lo?: string;
  storyParagraph2_th?: string;
  storyParagraph2_zh?: string;
  storyParagraph2_en?: string;
  backgroundImage?: string;
  values?: AboutValue[];
  updatedAt: string;
  // Add optional fields that might come from database
  aboutPageId?: string;
  createdAt?: string;
  heroBadgeImage?: string;
  heroBadgeText_lo?: string;
  heroBadgeText_th?: string;
  heroBadgeText_zh?: string;
  heroBadgeText_en?: string;
  heroDesignImage?: string;
}

interface AboutContentProps {
  locale?: string;
}

export default function AboutContent({ locale }: AboutContentProps) {
  const [aboutData, setAboutData] = useState<AboutPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAboutData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/about');
      const result = await response.json();
      
      if (result.success) {
        setAboutData(result.data);
      } else {
        console.error('Failed to fetch about data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, [locale]);

  if (isLoading) {
    return <Loading message="กำลังโหลดข้อมูล..." />;
  }

  if (!aboutData) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-gray-500">Failed to load about page content.</p>
      </div>
    );
  }

  // Helper function to get localized content
  const getLocalizedContent = (field: string) => {
    if (!aboutData) return '';
    const fieldName = `${field}_${locale}` as keyof AboutPageData;
    const localizedValue = aboutData[fieldName] as string;
    const fallbackValue = aboutData[`${field}_lo` as keyof AboutPageData] as string;
    return localizedValue || fallbackValue || '';
  };

  const getLocalizedValueContent = (value: AboutValue, field: string) => {
    const fieldName = `${field}_${locale}` as keyof AboutValue;
    const localizedValue = value[fieldName] as string;
    const fallbackValue = value[`${field}_lo` as keyof AboutValue] as string;
    return localizedValue || fallbackValue || '';
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 relative overflow-hidden">
      {/* Enhanced Background with better visual effects */}
      {aboutData.backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={aboutData.backgroundImage}
            alt="About Background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ filter: 'brightness(0.15) contrast(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-pink-50/40"></div>
        </div>
      )}
      
      {/* Enhanced floating elements for visual depth */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/3 left-10 w-40 h-40 bg-pink-300/15 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-rose-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-6 bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 bg-clip-text text-transparent leading-tight"
            >
              {getLocalizedContent('title')}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="w-24 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full mb-8"
            />
          </div>
        </div>

        {/* Story Section */}
        <div className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 md:p-12 mb-16"
            >
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold mb-8 text-center bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent"
              >
                {getLocalizedContent('storyTitle')}
              </motion.h2>
              
              <div className="space-y-6">
                {getLocalizedContent('storyParagraph1') && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-gray-700 leading-relaxed text-lg md:text-xl text-center"
                  >
                    {getLocalizedContent('storyParagraph1')}
                  </motion.p>
                )}
                
                {getLocalizedContent('storyParagraph2') && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-gray-700 leading-relaxed text-lg md:text-xl text-center"
                  >
                    {getLocalizedContent('storyParagraph2')}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Values Section */}
        {aboutData.values && aboutData.values.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                  Our Values
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-rose-400 mx-auto rounded-full"></div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
              >
                {aboutData.values.map((value, index) => (
                  <motion.div
                    key={value.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.9 + index * 0.1, ease: "easeOut" }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-8 text-center hover:shadow-2xl transition-all duration-500"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 1.0 + index * 0.1, type: "spring" }}
                      className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      {value.icon}
                    </motion.div>
                    <h3 className="font-bold text-xl md:text-2xl mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {getLocalizedValueContent(value, 'title')}
                    </h3>
                    {getLocalizedValueContent(value, 'description') && (
                      <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                        {getLocalizedValueContent(value, 'description')}
                      </p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
