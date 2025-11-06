'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingPage } from '@/components/shared/Loading';
import toast from 'react-hot-toast';

export default function AdminArticlesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchArticles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles?published=false');
      const data = await res.json();

      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Article deleted successfully');
        fetchArticles();
      } else {
        toast.error(data.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete article');
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Articles</h1>
          <p className="text-gray-600">Manage blog posts and articles</p>
        </div>
        <Link href="/admin/articles/new">
          <Button>
            <Plus size={20} />
            Add Article
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 mb-4">No articles yet</p>
              <Link href="/admin/articles/new">
                <Button>
                  <Plus size={20} />
                  Add First Article
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Image</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Author</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {article.featuredImage ? (
                            <Image
                              src={article.featuredImage}
                              alt={article.title_lo}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📝
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 line-clamp-1">{article.title_lo}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{article.title_en}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {article.createdBy?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {article.publishedAt 
                            ? new Date(article.publishedAt).toLocaleDateString()
                            : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {article.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              <Eye size={12} />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              <EyeOff size={12} />
                              Draft
                            </span>
                          )}
                          {article.isFeatured && (
                            <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Pencil size={18} className="text-gray-600" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(article.id, article.title_lo)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {articles.length > 0 && (
        <div className="mt-6 text-sm text-gray-600">
          Showing {articles.length} article{articles.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
