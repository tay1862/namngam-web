import { Metadata } from 'next';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Loading } from '@/components/shared/Loading';
import FAQsClient from './FAQsClient';

export const metadata: Metadata = {
  title: 'FAQs | Admin',
  description: 'Manage frequently asked questions',
};

export default async function FAQsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">FAQs</h1>
          <p className="text-neutral-600 mt-2">Manage frequently asked questions</p>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <FAQsClient />
      </Suspense>
    </div>
  );
}
