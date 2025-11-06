'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CategoryForm from '@/components/admin/forms/CategoryForm';
import { LoadingPage } from '@/components/shared/Loading';
import { Card, CardContent } from '@/components/ui/Card';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCategory() {
      try {
        const res = await fetch(`/api/categories/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          const formData = {
            name_lo: data.data.name_lo,
            name_th: data.data.name_th,
            name_zh: data.data.name_zh,
            name_en: data.data.name_en,
            description_lo: data.data.description_lo || '',
            description_th: data.data.description_th || '',
            description_zh: data.data.description_zh || '',
            description_en: data.data.description_en || '',
            image: data.data.image || '',
            isActive: data.data.isActive,
            order: data.data.order?.toString() || '0',
          };
          setCategory(formData);
        } else {
          setError(data.error || 'Category not found');
        }
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchCategory();
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
              onClick={() => router.push('/admin/categories')}
              className="btn btn-primary"
            >
              Back to Categories
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CategoryForm 
      categoryId={params.id as string} 
      initialData={category}
    />
  );
}
