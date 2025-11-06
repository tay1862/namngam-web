'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/forms/ProductForm';
import { LoadingPage } from '@/components/shared/Loading';
import { Card, CardContent } from '@/components/ui/Card';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        
        if (data.success) {
          // Transform product data for form
          const formData = {
            name_lo: data.data.name_lo,
            name_th: data.data.name_th,
            name_zh: data.data.name_zh,
            name_en: data.data.name_en,
            description_lo: data.data.description_lo || '',
            description_th: data.data.description_th || '',
            description_zh: data.data.description_zh || '',
            description_en: data.data.description_en || '',
            categoryId: data.data.categoryId,
            price: data.data.price?.toString() || '',
            currency: data.data.currency || 'LAK',
            sku: data.data.sku || '',
            featuredImage: data.data.featuredImage || '',
            galleryImages: data.data.images?.map((img: any) => img.url) || [],
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
          setProduct(formData);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
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
              onClick={() => router.push('/admin/products')}
              className="btn btn-primary"
            >
              Back to Products
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProductForm 
      productId={params.id as string} 
      initialData={product}
    />
  );
}
