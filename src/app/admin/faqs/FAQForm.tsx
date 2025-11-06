'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface FAQ {
  id: string;
  question_lo: string;
  question_th: string;
  question_zh: string;
  question_en: string;
  answer_lo: string;
  answer_th: string;
  answer_zh: string;
  answer_en: string;
  categoryId: string | null;
  isActive: boolean;
  order: number;
}

interface FAQCategory {
  id: string;
  name_lo: string;
  name_th: string;
  name_zh: string;
  name_en: string;
  isActive: boolean;
  order: number;
}

interface FAQFormProps {
  categories: FAQCategory[];
  faq?: FAQ;
  onClose: () => void;
  onSave: () => void;
}

export default function FAQForm({ categories, faq, onClose, onSave }: FAQFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_lo: faq?.question_lo || '',
    question_th: faq?.question_th || '',
    question_zh: faq?.question_zh || '',
    question_en: faq?.question_en || '',
    answer_lo: faq?.answer_lo || '',
    answer_th: faq?.answer_th || '',
    answer_zh: faq?.answer_zh || '',
    answer_en: faq?.answer_en || '',
    categoryId: faq?.categoryId || '',
    isActive: faq?.isActive !== undefined ? faq.isActive : true,
    order: faq?.order || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = faq ? `/api/faqs/${faq.id}` : '/api/faqs';
      const method = faq ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(faq ? 'FAQ updated successfully!' : 'FAQ created successfully!');
        onSave();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save FAQ');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error('Failed to save FAQ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-6">
          {faq ? 'Edit FAQ' : 'Create New FAQ'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">No Category</option>
              {categories
                .filter(cat => cat.isActive)
                .sort((a, b) => a.order - b.order)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name_en}
                  </option>
                ))}
            </select>
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Questions</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question (Lao)
              </label>
              <input
                type="text"
                name="question_lo"
                value={formData.question_lo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question (Thai)
              </label>
              <input
                type="text"
                name="question_th"
                value={formData.question_th}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question (Chinese)
              </label>
              <input
                type="text"
                name="question_zh"
                value={formData.question_zh}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question (English)
              </label>
              <input
                type="text"
                name="question_en"
                value={formData.question_en}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800">Answers</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer (Lao)
              </label>
              <textarea
                name="answer_lo"
                value={formData.answer_lo}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer (Thai)
              </label>
              <textarea
                name="answer_th"
                value={formData.answer_th}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer (Chinese)
              </label>
              <textarea
                name="answer_zh"
                value={formData.answer_zh}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer (English)
              </label>
              <textarea
                name="answer_en"
                value={formData.answer_en}
                onChange={handleChange}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              {isLoading ? 'Saving...' : (faq ? 'Update FAQ' : 'Create FAQ')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
