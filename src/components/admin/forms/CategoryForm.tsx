'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImagePicker from './ImagePicker';
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';

// Form validation schema
const categorySchema = z.object({
  name_lo: z.string().min(1, 'ຕ້ອງມີຊື່ພາສາລາວ'),
  name_th: z.string().min(1, 'ต้องมีชื่อภาษาไทย'),
  name_zh: z.string().min(1, '需要中文名称'),
  name_en: z.string().min(1, 'English name required'),
  description_lo: z.string(),
  description_th: z.string(),
  description_zh: z.string(),
  description_en: z.string(),
  image: z.string(),
  isActive: z.boolean(),
  order: z.string(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  categoryId?: string;
  initialData?: Partial<CategoryFormData>;
}

const languages = [
  { code: 'lo', label: 'ພາສາລາວ', flag: '🇱🇦' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function CategoryForm({ categoryId, initialData }: CategoryFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('lo');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name_lo: '',
      name_th: '',
      name_zh: '',
      name_en: '',
      description_lo: '',
      description_th: '',
      description_zh: '',
      description_en: '',
      image: '',
      isActive: true,
      order: '0',
      ...initialData,
    },
  });

  const image = watch('image') || '';
  const isActive = watch('isActive');

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories';
      const method = categoryId ? 'PUT' : 'POST';

      const payload = {
        ...data,
        order: parseInt(data.order) || 0,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(categoryId ? 'Category updated!' : 'Category created!');
        router.push('/admin/categories');
      } else {
        toast.error(result.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
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
              {categoryId ? 'Edit Category' : 'Add New Category'}
            </h1>
            <p className="text-gray-600">
              {categoryId ? 'Update category information' : 'Create a new category with multilingual support'}
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
                {categoryId ? 'Update' : 'Create'} Category
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
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
                      label={`Category Name (${lang.label})`}
                      {...register(`name_${lang.code}` as any)}
                      error={errors[`name_${lang.code}` as keyof typeof errors]?.message}
                      placeholder={`Enter category name in ${lang.label}`}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description ({lang.label})
                      </label>
                      <textarea
                        {...register(`description_${lang.code}` as any)}
                        rows={4}
                        className="input"
                        placeholder={`Enter category description in ${lang.label}`}
                      />
                    </div>
                  </Tabs.Content>
                ))}
              </Tabs.Root>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label.Root htmlFor="isActive" className="text-sm font-medium">
                  Active
                </Label.Root>
                <Switch.Root
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                  className="w-11 h-6 bg-gray-200 rounded-full data-[state=checked]:bg-pink-500 transition-colors"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[22px]" />
                </Switch.Root>
              </div>
            </CardContent>
          </Card>

          {/* Order */}
          <Card>
            <CardHeader>
              <CardTitle>Order</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                label="Display Order"
                type="number"
                {...register('order')}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImagePicker
                value={image}
                onChange={(url) => setValue('image', url)}
                label="Category Image"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
