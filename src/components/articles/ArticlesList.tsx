'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Calendar, User } from 'lucide-react';
import { Loading } from '@/components/shared/Loading';
import { CardLoader } from '@/components/shared/Loading';

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
  featuredImage: string | null;
  publishedAt: string | null;
  createdAt: string;
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
  content_lo: string;
  content_th: string;
  content_zh: string;
  content_en: string;
  createdById: string;
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

interface ArticlesListProps {
  featured?: boolean;
  limit?: number;
}

export default function ArticlesList({ featured = false, limit }: ArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations();

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (featured) {
        params.append('featured', 'true');
      }
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      const response = await fetch(`/api/articles?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setArticles(result.data);
      } else {
        setError(result.error || 'Failed to fetch articles');
      }
    } catch (err) {
      setError('Failed to fetch articles');
      console.error('Articles fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [featured, limit]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading message="กำลังโหลดบทความ..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchArticles}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2">{t('article.noArticles')}</h3>
        <p className="text-gray-600">
          {t('article.noArticlesDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/${locale}/articles/${article.slug}`}
          className="card group cursor-pointer"
        >
          {article.featuredImage ? (
            <div className="aspect-video rounded-xl overflow-hidden mb-4">
              <Image
                src={article.featuredImage}
                alt={article[`title_${locale}` as keyof Omit<typeof article, 'createdBy' | 'tags'>] as string}
                width={400}
                height={300}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 mb-4 flex items-center justify-center text-6xl">
              📝
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>
                {article.publishedAt 
                  ? new Date(article.publishedAt).toLocaleDateString(locale)
                  : new Date(article.createdAt).toLocaleDateString(locale)
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{article.createdBy.name}</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-xl mb-3 group-hover:text-pink-500 transition-colors">
            {article[`title_${locale}` as keyof Omit<typeof article, 'createdBy' | 'tags'>] as string}
          </h3>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {(article[`excerpt_${locale}` as keyof Omit<typeof article, 'createdBy' | 'tags'>] as string) || 
              (article[`content_${locale}` as keyof Omit<typeof article, 'createdBy' | 'tags'>] as string)?.substring(0, 150) + '...' ||
              t('article.readArticleToLearn')
            }
          </p>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {article.tags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-pink-50 text-pink-600 rounded-full text-xs font-medium"
                >
                  {tag[`name_${locale}` as keyof typeof tag] || tag.name}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  +{article.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          <span className="text-pink-500 font-medium">
            {t('article.readMore')} →
          </span>
        </Link>
      ))}
    </div>
  );
}
