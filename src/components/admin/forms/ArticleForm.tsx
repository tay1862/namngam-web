'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ImagePicker from './ImagePicker';
import RichTextEditor from './RichTextEditor';
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';

// Form validation schema
const articleSchema = z.object({
  title_lo: z.string().min(1, 'ຕ້ອງມີຫົວຂໍ້ພາສາລາວ'),
  title_th: z.string().min(1, 'ต้องมีหัวข้อภาษาไทย'),
  title_zh: z.string().min(1, '需要中文标题'),
  title_en: z.string().min(1, 'English title required'),
  content_lo: z.string(),
  content_th: z.string(),
  content_zh: z.string(),
  content_en: z.string(),
  excerpt_lo: z.string(),
  excerpt_th: z.string(),
  excerpt_zh: z.string(),
  excerpt_en: z.string(),
  featuredImage: z.string(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle_lo: z.string(),
  metaTitle_th: z.string(),
  metaTitle_zh: z.string(),
  metaTitle_en: z.string(),
  metaDescription_lo: z.string(),
  metaDescription_th: z.string(),
  metaDescription_zh: z.string(),
  metaDescription_en: z.string(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  articleId?: string;
  initialData?: Partial<ArticleFormData>;
}

const languages = [
  { code: 'lo', label: 'ພາສາລາວ', flag: '🇱🇦' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function ArticleForm({ articleId, initialData }: ArticleFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('lo');
  const [loading, setLoading] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title_lo: '',
      title_th: '',
      title_zh: '',
      title_en: '',
      content_lo: '',
      content_th: '',
      content_zh: '',
      content_en: '',
      excerpt_lo: '',
      excerpt_th: '',
      excerpt_zh: '',
      excerpt_en: '',
      featuredImage: '',
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
  const isPublished = watch('isPublished');
  const isFeatured = watch('isFeatured');

  const onSubmit = async (data: ArticleFormData) => {
    setLoading(true);
    try {
      const url = articleId ? `/api/articles/${articleId}` : '/api/articles';
      const method = articleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(articleId ? 'Article updated!' : 'Article created!');
        router.push('/admin/articles');
      } else {
        toast.error(result.error || 'Failed to save article');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save article');
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
              {articleId ? 'Edit Article' : 'Add New Article'}
            </h1>
            <p className="text-gray-600">
              {articleId ? 'Update article content' : 'Create a new article with multilingual support'}
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
                {articleId ? 'Update' : 'Publish'} Article
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Content */}
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
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
                      label={`Title (${lang.label})`}
                      {...register(`title_${lang.code}` as any)}
                      error={errors[`title_${lang.code}` as keyof typeof errors]?.message}
                      placeholder={`Enter article title in ${lang.label}`}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excerpt ({lang.label})
                      </label>
                      <textarea
                        {...register(`excerpt_${lang.code}` as any)}
                        rows={2}
                        className="input"
                        placeholder={`Short summary in ${lang.label}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content ({lang.label})
                      </label>
                      <Controller
                        name={`content_${lang.code}` as any}
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={`Write article content in ${lang.label}...`}
                          />
                        )}
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
        </div>
      </div>
    </form>
  );
}
