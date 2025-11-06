'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, FileText, FolderOpen, Eye, Users, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingPage } from '@/components/shared/Loading';
import { createOptimizedQuery } from '@/lib/performance';

interface DashboardStats {
  totalProducts: number;
  totalArticles: number;
  totalCategories: number;
  totalViews: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
  systemHealth: SystemHealth;
}

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  description: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  database: 'connected' | 'disconnected';
  storage: 'normal' | 'warning' | 'critical';
  lastBackup?: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDashboardStats();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [
        productsResponse,
        articlesResponse,
        categoriesResponse,
        usersResponse,
        viewsResponse,
        activityResponse,
        healthResponse
      ] = await Promise.allSettled([
        fetch('/api/products?limit=1'),
        fetch('/api/articles?limit=1'),
        fetch('/api/categories?limit=1'),
        fetch('/api/users?limit=1'),
        fetch('/api/analytics/views'),
        fetch('/api/admin/activity'),
        fetch('/api/admin/health')
      ]);

      // Extract counts from responses
      const totalProducts = productsResponse.status === 'fulfilled' 
        ? (await productsResponse.value.json()).pagination?.total || 0 
        : 0;
      
      const totalArticles = articlesResponse.status === 'fulfilled'
        ? (await articlesResponse.value.json()).pagination?.total || 0
        : 0;
      
      const totalCategories = categoriesResponse.status === 'fulfilled'
        ? (await categoriesResponse.value.json()).pagination?.total || 0
        : 0;
      
      const totalUsers = usersResponse.status === 'fulfilled'
        ? (await usersResponse.value.json()).pagination?.total || 0
        : 0;
      
      const totalViews = viewsResponse.status === 'fulfilled'
        ? (await viewsResponse.value.json()).total || 0
        : 0;
      
      const recentActivity = activityResponse.status === 'fulfilled'
        ? (await activityResponse.value.json()).data || []
        : [];
      
      const systemHealth = healthResponse.status === 'fulfilled'
        ? (await healthResponse.value.json())
        : { status: 'error' as const };

      setStats({
        totalProducts,
        totalArticles,
        totalCategories,
        totalViews,
        totalUsers,
        recentActivity,
        systemHealth
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!session) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <LoadingPage />;
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Articles',
      value: stats.totalArticles.toLocaleString(),
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: 'Categories',
      value: stats.totalCategories.toLocaleString(),
      icon: FolderOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      change: '+2',
      changeType: 'neutral' as const,
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      change: '+23%',
      changeType: 'increase' as const,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      change: '+5%',
      changeType: 'increase' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome back, {typeof session.user?.name === 'string' ? session.user.name : 'Admin'}!
          </h1>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Clock size={16} />
          Refresh
        </button>
      </div>

      {/* System Health Alert */}
      {stats.systemHealth.status !== 'healthy' && (
        <div className={`p-4 rounded-lg border ${
          stats.systemHealth.status === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-medium">
              {stats.systemHealth.status === 'error' ? 'System Issues Detected' : 'System Warnings'}
            </span>
          </div>
          <p className="mt-2 text-sm">
            {stats.systemHealth.status === 'error' 
              ? 'Some system components are not functioning properly. Please check the system health page.'
              : 'Some system components need attention. Performance may be degraded.'
            }
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.changeType !== 'neutral' && (
                      <div className={`flex items-center gap-1 text-sm mt-1 ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp size={14} />
                        <span>{stat.change}</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/admin/products/new')}
                className="w-full btn btn-primary justify-start"
              >
                <Package size={20} />
                Add New Product
              </button>
              <button 
                onClick={() => router.push('/admin/articles/new')}
                className="w-full btn btn-secondary justify-start"
              >
                <FileText size={20} />
                Write Article
              </button>
              <button 
                onClick={() => router.push('/admin/categories')}
                className="w-full btn btn-ghost justify-start"
              >
                <FolderOpen size={20} />
                Manage Categories
              </button>
              <button 
                onClick={() => router.push('/admin/media')}
                className="w-full btn btn-ghost justify-start"
              >
                <Eye size={20} />
                Media Library
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                stats.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'create' ? 'bg-green-100' :
                      activity.type === 'update' ? 'bg-blue-100' :
                      'bg-red-100'
                    }`}>
                      {activity.type === 'create' ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : activity.type === 'update' ? (
                        <Clock size={16} className="text-blue-600" />
                      ) : (
                        <AlertCircle size={16} className="text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof activity.user === 'object'
                          ? (activity.user.name || activity.user.email)
                          : activity.user} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {stats.recentActivity.length > 5 && (
              <button 
                onClick={() => router.push('/admin/activity')}
                className="w-full mt-4 text-center text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All Activity
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
