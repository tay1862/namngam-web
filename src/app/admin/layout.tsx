'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { NextIntlClientProvider } from 'next-intl';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminNavbar from '@/components/admin/layout/AdminNavbar';
import '@/styles/globals.css';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    // Skip auth check for login page
    if (pathname === '/admin/login') return;
    
    if (!session) {
      router.push('/admin/login');
      return;
    }
  }, [session, status, router, pathname]);

  // For login page, just render children without auth checks or sidebar
  if (pathname === '/admin/login') {
    return <div>{children}</div>;
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [messages, setMessages] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load English messages for admin section
    import('@/messages/en.json').then((module) => {
      setMessages(module.default);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to load messages:', error);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <NextIntlClientProvider locale="en" messages={messages}>
        <AdminLayoutContent>{children}</AdminLayoutContent>
        <Toaster position="top-right" />
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
