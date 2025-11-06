'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import FAQForm from './FAQForm';

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
  category?: {
    id: string;
    name_lo: string;
    name_th: string;
    name_zh: string;
    name_en: string;
  };
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
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

export default function FAQsClient() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch('/api/faqs');
      const data = await response.json();
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/faq-categories');
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFAQs();
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleToggleActive = async (faq: FAQ) => {
    try {
      const response = await fetch(`/api/faqs/${faq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...faq,
          isActive: !faq.isActive,
        }),
      });

      if (response.ok) {
        fetchFAQs();
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-pulse text-pink-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white"
        >
          Add New FAQ
        </Button>
      </div>

      {/* FAQs Table */}
      <Card>
        <CardHeader>
          <CardTitle>FAQs ({filteredFaqs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Question</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Order</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-neutral-800 line-clamp-2">
                          {faq.question_en}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                          {faq.answer_en}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {faq.category ? (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                          {faq.category.name_en}
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-sm">No category</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-neutral-600">{faq.order}</span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(faq)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          faq.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingFaq(faq)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(faq.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-neutral-500">
                  {searchTerm ? 'No FAQs found matching your search.' : 'No FAQs found.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <FAQForm
          categories={categories}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={() => {
            setIsCreateModalOpen(false);
            fetchFAQs();
          }}
        />
      )}

      {/* Edit Modal */}
      {editingFaq && (
        <FAQForm
          categories={categories}
          faq={editingFaq}
          onClose={() => setEditingFaq(null)}
          onSave={() => {
            setEditingFaq(null);
            fetchFAQs();
          }}
        />
      )}
    </div>
  );
}
