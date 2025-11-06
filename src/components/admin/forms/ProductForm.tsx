'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImagePicker from './ImagePicker';
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';

// Form validation schema
const productSchema = z.object({
  // Names (required for all languages)
  name_lo: z.string().min(1, 'ຕ້ອງມີຊື່ພາສາລາວ'),
  name_th: z.string().min(1, 'ต้องมีชื่อภาษาไทย'),
  name_zh: z.string().min(1, '需要中文名称'),
  name_en: z.string().min(1, 'English name required'),
  
  // Descriptions (optional)
  description_lo: z.string(),
  description_th: z.string(),
  description_zh: z.string(),
  description_en: z.string(),
  
  // Product details
  categoryId: z.string().min(1, 'ກະລຸນາເລືອກໝວດໝູ່'),
  price: z.string(),
  currency: z.string(),
  sku: z.string(),
  
  // Images
  featuredImage: z.string(),
  galleryImages: z.array(z.string()),
  
  // Status
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  
  // SEO (optional)
  metaTitle_lo: z.string(),
  metaTitle_th: z.string(),
  metaTitle_zh: z.string(),
  metaTitle_en: z.string(),
  metaDescription_lo: z.string(),
  metaDescription_th: z.string(),
  metaDescription_zh: z.string(),
  metaDescription_en: z.string(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData>;
}

const languages = [
  { code: 'lo', label: 'ພາສາລາວ', flag: '🇱🇦' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('lo');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name_lo: '',
      name_th: '',
      name_zh: '',
      name_en: '',
      description_lo: '',
      description_th: '',
      description_zh: '',
      description_en: '',
      categoryId: '',
      price: '',
      currency: 'LAK',
      sku: '',
      featuredImage: '',
      galleryImages: [],
      isPublished: false,
      isFeatured: false,
      metaTitle_lo: '',
      metaTitle_th: '',
      metaTitle_zh: '',
      metaTitle_en: '',
      metaDescription_lo: '',
      metaDescription_th: '',
      metaDescription_zh: '',
      metaDescription_en: '',
      ...initialData,
    },
  });

  const featuredImage = watch('featuredImage') || '';
  const galleryImages = watch('galleryImages') || [];
  const isPublished = watch('isPublished');
  const isFeatured = watch('isFeatured');

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';

      // Transform galleryImages array to images array format
      const payload = {
        ...data,
        images: (data.galleryImages || []).map((url, index) => ({
          url,
          alt_lo: '',
          alt_th: '',
          alt_zh: '',
          alt_en: '',
          order: index,
        })),
      };
      delete (payload as any).galleryImages;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(productId ? 'Product updated!' : 'Product created!');
        router.push('/admin/products');
      } else {
        toast.error(result.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryImageAdd = (url: string) => {
    const current = galleryImages || [];
    setValue('galleryImages', [...current, url]);
  };

  const removeGalleryImage = (index: number) => {
    const current = galleryImages || [];
    setValue('galleryImages', current.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {productId ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-600">
              {productId ? 'Update product information' : 'Create a new product with multilingual support'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                {productId ? 'Update' : 'Create'} Product
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multi-language Content */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex gap-2 border-b mb-6">
                  {languages.map((lang) => (
                    <Tabs.Trigger
                      key={lang.code}
                      value={lang.code}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-pink-600 data-[state=active]:border-b-2 data-[state=active]:border-pink-600 transition-colors"
                    >
                      {lang.flag} {lang.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {languages.map((lang) => (
                  <Tabs.Content key={lang.code} value={lang.code} className="space-y-4">
                    <Input
                      label={`Product Name (${lang.label})`}
                      {...register(`name_${lang.code}` as any)}
                      error={errors[`name_${lang.code}` as keyof typeof errors]?.message}
                      placeholder={`Enter product name in ${lang.label}`}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description ({lang.label})
                      </label>
                      <textarea
                        {...register(`description_${lang.code}` as any)}
                        rows={6}
                        className="input"
                        placeholder={`Enter product description in ${lang.label}`}
                      />
                    </div>
                  </Tabs.Content>
                ))}
              </Tabs.Root>
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>SEO Settings</CardTitle>
                <button
                  type="button"
                  onClick={() => setShowSeo(!showSeo)}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  {showSeo ? 'Hide' : 'Show'}
                </button>
              </div>
            </CardHeader>
            {showSeo && (
              <CardContent>
                <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                  <Tabs.List className="flex gap-2 border-b mb-6">
                    {languages.map((lang) => (
                      <Tabs.Trigger
                        key={lang.code}
                        value={lang.code}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:text-pink-600 data-[state=active]:border-b-2 data-[state=active]:border-pink-600 transition-colors"
                      >
                        {lang.flag} {lang.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>

                  {languages.map((lang) => (
                    <Tabs.Content key={lang.code} value={lang.code} className="space-y-4">
                      <Input
                        label={`Meta Title (${lang.label})`}
                        {...register(`metaTitle_${lang.code}` as any)}
                        placeholder="SEO title"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description ({lang.label})
                        </label>
                        <textarea
                          {...register(`metaDescription_${lang.code}` as any)}
                          rows={3}
                          className="input"
                          placeholder="SEO description"
                        />
                      </div>
                    </Tabs.Content>
                  ))}
                </Tabs.Root>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label.Root htmlFor="isPublished" className="text-sm font-medium">
                  Published
                </Label.Root>
                <Switch.Root
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={(checked) => setValue('isPublished', checked)}
                  className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-pink-500 transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>
              <div className="flex items-center justify-between">
                <Label.Root htmlFor="isFeatured" className="text-sm font-medium">
                  Featured
                </Label.Root>
                <Switch.Root
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={(checked) => setValue('isFeatured', checked)}
                  className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-pink-500 transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <select {...register('categoryId')} className="input">
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_lo}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="Price"
                    type="number"
                    {...register('price')}
                    placeholder="0"
                  />
                </div>
                <div className="w-24">
                  <Input
                    label="Currency"
                    {...register('currency')}
                    disabled
                  />
                </div>
              </div>
              <Input
                label="SKU (Optional)"
                {...register('sku')}
                placeholder="Product code"
              />
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePicker
                value={featuredImage}
                onChange={(url) => setValue('featuredImage', url)}
                label="Featured Image"
              />
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Gallery Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {galleryImages.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <Image
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ImagePicker
                value=""
                onChange={handleGalleryImageAdd}
                label="Add Gallery Image"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
