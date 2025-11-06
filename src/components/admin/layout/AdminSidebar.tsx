'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FileText,
  FolderOpen,
  Settings,
  Image as ImageIcon,
  Users,
  HelpCircle,
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { addCacheBusting } from '@/lib/performance';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Articles', href: '/admin/articles', icon: FileText },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'About Page', href: '/admin/about', icon: FileText },
  { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
  { name: 'Media', href: '/admin/media', icon: ImageIcon },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Users', href: '/admin/users', icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { settings } = useSettings();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center space-x-3">
          <div className="relative w-10 h-10 bg-pink-500 rounded-xl overflow-hidden flex items-center justify-center">
            <Image
              src={settings?.logo ? addCacheBusting(settings.logo) : "/logo.png"}
              alt="NAMNGAM"
              width={40}
              height={40}
              className="object-contain p-1"
            />
          </div>
          <div>
            <span className="text-lg font-heading font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent block">
              NAMNGAM
            </span>
            <span className="text-xs text-gray-500">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-pink-50 text-pink-500 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-500 transition-colors"
        >
          <span>→</span>
          <span>View Website</span>
        </Link>
      </div>
    </aside>
  );
}
