'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ArticlesList from '@/components/articles/ArticlesList';

export default function LatestArticles() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 via-pink-25/20 to-gray-50 relative overflow-hidden">
      {/* Subtle background elements for visual continuity */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-pink-100/15 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-pink-150/15 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2 bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              {t('article.latest')}
            </h2>
            <p className="text-gray-600 text-lg">{t('article.featured')}</p>
          </div>
          <Link
            href={`/${locale}/articles`}
            className="flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium group"
          >
            {t('common.viewAll')}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ArticlesList limit={2} featured={true} />
        </motion.div>
      </div>
    </section>
  );
}
