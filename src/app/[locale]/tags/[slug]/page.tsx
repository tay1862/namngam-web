'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import ArticlesList from '@/components/articles/ArticlesList';

interface TagArticlesResponse {
  tag: {
    id: string;
    name_lo: string;
    name_th: string;
    name_zh: string;
    name_en: string;
    slug: string;
  };
  articles: Array<{
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
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function TagPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [data, setData] = useState<TagArticlesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTagArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/tags/${params.slug}/articles`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch tag articles');
      }
    } catch (err) {
      setError('Failed to fetch tag articles');
      console.error('Tag articles fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    if (params.slug) {
      fetchTagArticles();
    }
  }, [params.slug, fetchTagArticles]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="animate-pulse">
          <div className="bg-gray-100 h-48"></div>
          <div className="container-custom py-12">
            <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index}>
                  <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Tag Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The tag you are looking for does not exist.'}</p>
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

  const tagName = data.tag[`name_${locale}` as keyof typeof data.tag] as string;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-50 via-white to-pink-50 py-16">
        <div className="container-custom">
          <Link
            href={`/${locale}/articles`}
            className="inline-flex items-center gap-2 text-pink-500 mb-6 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Articles
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Tag className="text-pink-500" size={48} />
              <h1 className="text-5xl font-heading font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                {tagName}
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Showing {data.articles.length} article{data.articles.length !== 1 ? 's' : ''} tagged with &ldquo;{tagName}&rdquo;
            </p>
          </motion.div>
        </div>
      </div>

      {/* Articles */}
      <div className="container-custom py-12">
        {data.articles.length > 0 ? (
          <div className="max-w-5xl mx-auto">
            <ArticlesList limit={data.articles.length} />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-600 mb-8">
              There are no articles tagged with &ldquo;{tagName}&rdquo; yet.
            </p>
            <Link
              href={`/${locale}/articles`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Browse All Articles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
