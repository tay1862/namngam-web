import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AboutForm from '@/components/admin/forms/AboutForm';

export default async function AboutPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/admin/login');
  }

  const aboutPage = await prisma.aboutPage.findUnique({
    where: { id: 'about_page' },
    include: {
      values: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage About Page</h1>
        <p className="mt-2 text-gray-600">
          Edit the content of your about page to tell your brand story
        </p>
      </div>

      <AboutForm initialData={aboutPage || undefined} />
    </div>
  );
}
