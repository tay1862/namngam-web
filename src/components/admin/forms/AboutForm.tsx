'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { X, Plus, MoveUp, MoveDown } from 'lucide-react';
import ImagePicker from './ImagePicker';

interface AboutValue {
  id?: string;
  icon: string;
  title_lo: string;
  title_th: string;
  title_zh: string;
  title_en: string;
  description_lo?: string;
  description_th?: string;
  description_zh?: string;
  description_en?: string;
  order?: number;
}

interface AboutPageData {
  title_lo: string;
  title_th: string;
  title_zh: string;
  title_en: string;
  storyTitle_lo: string;
  storyTitle_th: string;
  storyTitle_zh: string;
  storyTitle_en: string;
  storyParagraph1_lo?: string;
  storyParagraph1_th?: string;
  storyParagraph1_zh?: string;
  storyParagraph1_en?: string;
  storyParagraph2_lo?: string;
  storyParagraph2_th?: string;
  storyParagraph2_zh?: string;
  storyParagraph2_en?: string;
  backgroundImage?: string;
  values?: AboutValue[];
}

interface AboutFormProps {
  initialData?: any; // Using any type to accept the actual Prisma type
}

const emptyValue: AboutValue = {
  icon: '',
  title_lo: '',
  title_th: '',
  title_zh: '',
  title_en: '',
  description_lo: '',
  description_th: '',
  description_zh: '',
  description_en: '',
};

export default function AboutForm({ initialData }: AboutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AboutPageData>({
    title_lo: initialData?.title_lo || '',
    title_th: initialData?.title_th || '',
    title_zh: initialData?.title_zh || '',
    title_en: initialData?.title_en || '',
    storyTitle_lo: initialData?.storyTitle_lo || '',
    storyTitle_th: initialData?.storyTitle_th || '',
    storyTitle_zh: initialData?.storyTitle_zh || '',
    storyTitle_en: initialData?.storyTitle_en || '',
    storyParagraph1_lo: initialData?.storyParagraph1_lo || '',
    storyParagraph1_th: initialData?.storyParagraph1_th || '',
    storyParagraph1_zh: initialData?.storyParagraph1_zh || '',
    storyParagraph1_en: initialData?.storyParagraph1_en || '',
    storyParagraph2_lo: initialData?.storyParagraph2_lo || '',
    storyParagraph2_th: initialData?.storyParagraph2_th || '',
    storyParagraph2_zh: initialData?.storyParagraph2_zh || '',
    storyParagraph2_en: initialData?.storyParagraph2_en || '',
    backgroundImage: initialData?.backgroundImage || '',
    values: initialData?.values || [emptyValue],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleValueChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addValue = () => {
    setFormData(prev => ({
      ...prev,
      values: [...(prev.values || []), { ...emptyValue }],
    }));
  };

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values?.filter((_, i) => i !== index),
    }));
  };

  const moveValue = (index: number, direction: 'up' | 'down') => {
    if (!formData.values) return;
    
    const newValues = [...formData.values];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newValues.length) {
      [newValues[index], newValues[targetIndex]] = [newValues[targetIndex], newValues[index]];
      setFormData(prev => ({ ...prev, values: newValues }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Log the form data for debugging
      console.log('Submitting about page data:', JSON.stringify(formData, null, 2));
      
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is OK and has JSON content
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        toast.error(`Server error: ${response.status} ${response.statusText}`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', await response.text());
        toast.error('Server returned non-JSON response');
        return;
      }
      
      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        toast.success('About page updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update about page');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to update about page');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Page Titles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Page Title</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lao</label>
            <input
              type="text"
              name="title_lo"
              value={formData.title_lo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thai</label>
            <input
              type="text"
              name="title_th"
              value={formData.title_th}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chinese</label>
            <input
              type="text"
              name="title_zh"
              value={formData.title_zh}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
            <input
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Our Story Section</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Section Title</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lao</label>
              <input
                type="text"
                name="storyTitle_lo"
                value={formData.storyTitle_lo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thai</label>
              <input
                type="text"
                name="storyTitle_th"
                value={formData.storyTitle_th}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chinese</label>
              <input
                type="text"
                name="storyTitle_zh"
                value={formData.storyTitle_zh}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
              <input
                type="text"
                name="storyTitle_en"
                value={formData.storyTitle_en}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">First Paragraph</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lao</label>
              <textarea
                name="storyParagraph1_lo"
                value={formData.storyParagraph1_lo}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thai</label>
              <textarea
                name="storyParagraph1_th"
                value={formData.storyParagraph1_th}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chinese</label>
              <textarea
                name="storyParagraph1_zh"
                value={formData.storyParagraph1_zh}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
              <textarea
                name="storyParagraph1_en"
                value={formData.storyParagraph1_en}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Second Paragraph</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lao</label>
              <textarea
                name="storyParagraph2_lo"
                value={formData.storyParagraph2_lo}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thai</label>
              <textarea
                name="storyParagraph2_th"
                value={formData.storyParagraph2_th}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chinese</label>
              <textarea
                name="storyParagraph2_zh"
                value={formData.storyParagraph2_zh}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
              <textarea
                name="storyParagraph2_en"
                value={formData.storyParagraph2_en}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background Image (Optional)</label>
          <ImagePicker
            value={formData.backgroundImage || ''}
            onChange={(url) => setFormData(prev => ({ ...prev, backgroundImage: url }))}
            folder="about"
          />
        </div>
      </div>

      {/* Company Values */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Company Values</h2>
          <Button
            type="button"
            onClick={addValue}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Value
          </Button>
        </div>

        {formData.values?.map((value, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Value #{index + 1}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveValue(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  <MoveUp size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => moveValue(index, 'down')}
                  disabled={index === (formData.values?.length || 0) - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                >
                  <MoveDown size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input
                  type="text"
                  value={value.icon}
                  onChange={(e) => handleValueChange(index, 'icon', e.target.value)}
                  placeholder="💎"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Lao)</label>
                <input
                  type="text"
                  value={value.title_lo}
                  onChange={(e) => handleValueChange(index, 'title_lo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Thai)</label>
                <input
                  type="text"
                  value={value.title_th}
                  onChange={(e) => handleValueChange(index, 'title_th', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Chinese)</label>
                <input
                  type="text"
                  value={value.title_zh}
                  onChange={(e) => handleValueChange(index, 'title_zh', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={value.title_en}
                  onChange={(e) => handleValueChange(index, 'title_en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Lao)</label>
                <textarea
                  value={value.description_lo}
                  onChange={(e) => handleValueChange(index, 'description_lo', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Thai)</label>
                <textarea
                  value={value.description_th}
                  onChange={(e) => handleValueChange(index, 'description_th', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Chinese)</label>
                <textarea
                  value={value.description_zh}
                  onChange={(e) => handleValueChange(index, 'description_zh', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea
                  value={value.description_en}
                  onChange={(e) => handleValueChange(index, 'description_en', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="px-6"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
