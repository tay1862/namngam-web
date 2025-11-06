'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
  category?: {
    id: string;
    name_lo: string;
    name_th: string;
    name_zh: string;
    name_en: string;
  };
}

interface FAQCategory {
  id: string;
  name_lo: string;
  name_th: string;
  name_zh: string;
  name_en: string;
  _count: {
    faqs: number;
  };
}

export default function FAQsClient() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const t = useTranslations('faq');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch FAQs
      const faqsResponse = await fetch(
        `/api/faqs${selectedCategory !== 'all' ? `?categoryId=${selectedCategory}` : ''}`
      );
      const faqsData = await faqsResponse.json();
      setFaqs(faqsData || []);

      // Fetch categories (only once)
      if (categories.length === 0) {
        const categoriesResponse = await fetch('/api/faq-categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, categories.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getLocalizedText = (item: any, field: string) => {
    const locale = document.documentElement.lang || 'en';
    return item[`${field}_${locale}`] || item[`${field}_en`] || '';
  };

  const filteredFaqs = faqs.filter(faq => {
    if (!searchTerm) return true;
    
    const question = getLocalizedText(faq, 'question').toLowerCase();
    const answer = getLocalizedText(faq, 'answer').toLowerCase();
    return question.includes(searchTerm.toLowerCase()) || 
           answer.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-pulse text-pink-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Search and Filter Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-white rounded-3xl shadow-sm p-8 border border-neutral-100">
          {/* Search */}
          <div className="mb-8">
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-neutral-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 outline-none"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              {t('categories.all')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {getLocalizedText(category, 'name')} ({category._count.faqs})
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-neutral-600 text-lg">
                {searchTerm ? t('noResults') : t('noFaqs')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card 
                key={faq.id} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => toggleExpanded(faq.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-neutral-800 pr-4">
                      {getLocalizedText(faq, 'question')}
                    </CardTitle>
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-pink-500 transition-transform duration-300 ${
                          expandedItems.has(faq.id) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {faq.category && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-full">
                        {getLocalizedText(faq.category, 'name')}
                      </span>
                    </div>
                  )}
                </CardHeader>
                
                {expandedItems.has(faq.id) && (
                  <CardContent className="pt-0">
                    <div className="prose prose-pink max-w-none">
                      <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                        {getLocalizedText(faq, 'answer')}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
