'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArticleForm from '@/components/admin/forms/ArticleForm';
import { LoadingPage } from '@/components/shared/Loading';
import { Card, CardContent } from '@/components/ui/Card';

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          const formData = {
            title_lo: data.data.title_lo,
            title_th: data.data.title_th,
            title_zh: data.data.title_zh,
            title_en: data.data.title_en,
            content_lo: data.data.content_lo || '',
            content_th: data.data.content_th || '',
            content_zh: data.data.content_zh || '',
            content_en: data.data.content_en || '',
            excerpt_lo: data.data.excerpt_lo || '',
            excerpt_th: data.data.excerpt_th || '',
            excerpt_zh: data.data.excerpt_zh || '',
            excerpt_en: data.data.excerpt_en || '',
            featuredImage: data.data.featuredImage || '',
            isPublished: data.data.isPublished,
            isFeatured: data.data.isFeatured,
            metaTitle_lo: data.data.metaTitle_lo || '',
            metaTitle_th: data.data.metaTitle_th || '',
            metaTitle_zh: data.data.metaTitle_zh || '',
            metaTitle_en: data.data.metaTitle_en || '',
            metaDescription_lo: data.data.metaDescription_lo || '',
            metaDescription_th: data.data.metaDescription_th || '',
            metaDescription_zh: data.data.metaDescription_zh || '',
            metaDescription_en: data.data.metaDescription_en || '',
          };
          setArticle(formData);
        } else {
          setError(data.error || 'Article not found');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div>
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/admin/articles')}
              className="btn btn-primary"
            >
              Back to Articles
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ArticleForm 
      articleId={params.id as string} 
      initialData={article}
    />
  );
}
