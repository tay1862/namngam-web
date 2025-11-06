'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Facebook,
  MessageCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import ArticlesList from '@/components/articles/ArticlesList';
import { ArticleStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData';

interface Article {
  id: string;
  slug: string;
  title_lo: string;
  title_th: string;
  title_zh: string;
  title_en: string;
  excerpt_lo: string;
  excerpt_th: string;
  excerpt_zh: string;
  excerpt_en: string;
  content_lo: string;
  content_th: string;
  content_zh: string;
  content_en: string;
  featuredImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  viewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle_lo: string;
  metaTitle_th: string;
  metaTitle_zh: string;
  metaTitle_en: string;
  metaDesc_lo: string;
  metaDesc_th: string;
  metaDesc_zh: string;
  metaDesc_en: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    id: string;
    articleId: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/articles/slug/${params.slug}`);
      const result = await response.json();
      
      if (result.success) {
        setArticle(result.data);
      } else {
        setError(result.error || 'Failed to fetch article');
      }
    } catch (err) {
      setError('Failed to fetch article');
      console.error('Article fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    if (params.slug) {
      fetchArticle();
    }
  }, [params.slug, fetchArticle]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.[`title_${locale}` as keyof typeof article] as string;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'line':
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
          <div className="container-custom py-12">
            <div className="max-w-4xl mx-auto">
              <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded mb-8 w-4/6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The article you are looking for does not exist.'}</p>
          <Link
            href={`/${locale}/articles`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const articleTitle = article[`title_${locale}` as keyof typeof article] as string;
  const articleExcerpt = article[`excerpt_${locale}` as keyof typeof article] as string;
  const articleContent = article[`content_${locale}` as keyof typeof article] as string;

  const breadcrumbs = [
    { name: t('nav.home'), url: `/${locale}` },
    { name: t('nav.articles'), url: `/${locale}/articles` },
    { name: articleTitle, url: `/${locale}/articles/${params.slug}` },
  ];

  return (
    <>
      <Head>
        <title>{articleTitle} | NAMNGAM</title>
        <meta name="description" content={articleExcerpt} />
        <meta property="og:title" content={articleTitle} />
        <meta property="og:description" content={articleExcerpt} />
        <meta property="og:image" content={article.featuredImage || '/Logo-namngam-white.svg'} />
        <meta property="og:url" content={`${process.env.NEXTAUTH_URL}/${locale}/articles/${params.slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={articleTitle} />
        <meta name="twitter:description" content={articleExcerpt} />
        <meta name="twitter:image" content={article.featuredImage || '/Logo-namngam-white.svg'} />
        
        {/* Structured Data */}
        <ArticleStructuredData article={article} locale={locale} />
        <BreadcrumbStructuredData breadcrumbs={breadcrumbs} locale={locale} />
      </Head>
      <div className="min-h-screen">
      {/* Header Image */}
      {article.featuredImage ? (
        <div className="relative h-96 overflow-hidden">
          <Image
            src={article.featuredImage}
            alt={articleTitle}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 container-custom pb-8">
            <Link
              href={`/${locale}/articles`}
              className="inline-flex items-center gap-2 text-white mb-6 hover:text-pink-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Articles
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-4"
            >
              {articleTitle}
            </motion.h1>
            <p className="text-white/90 text-lg max-w-3xl">
              {articleExcerpt}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 py-16">
          <div className="container-custom">
            <Link
              href={`/${locale}/articles`}
              className="inline-flex items-center gap-2 text-white mb-6 hover:text-pink-200 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Articles
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-heading font-bold text-white mb-4"
            >
              {articleTitle}
            </motion.h1>
            <p className="text-white/90 text-lg max-w-3xl">
              {articleExcerpt}
            </p>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{article.createdBy.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                {article.publishedAt 
                  ? new Date(article.publishedAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : new Date(article.createdAt).toLocaleDateString(locale, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{article.viewCount} views</span>
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium">Share:</span>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook size={18} />
              </button>
              <button
                onClick={() => handleShare('line')}
                className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                aria-label="Share on LINE"
              >
                <MessageCircle size={18} />
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                aria-label="Share on WhatsApp"
              >
                <MessageCircle size={18} />
              </button>
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/${locale}/tags/${tag.slug}`}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors"
                >
                  {tag[`name_${locale}` as keyof typeof tag] || tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Article Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: articleContent }}
          />

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t">
            <Link
              href={`/${locale}/articles`}
              className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium"
            >
              <ArrowLeft size={20} />
              Back to All Articles
            </Link>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            Related Articles
          </h2>
          <ArticlesList limit={3} />
        </div>
      </section>
      </div>
    </>
  );
}
