'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useSettings } from '@/hooks/useSettings';
import { addCacheBusting } from '@/lib/performance';
import { ariaRoles, ariaProperties, focusManager } from '@/lib/accessibility';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard navigation for mobile menu
  useEffect(() => {
    if (isOpen && mobileMenuRef.current) {
      const cleanup = focusManager.trapFocus(mobileMenuRef.current);
      return cleanup;
    }
  }, [isOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('products'), href: `/${locale}/products` },
    { name: t('articles'), href: `/${locale}/articles` },
    { name: t('contact'), href: `/${locale}/contact` },
  ];

  return (
    <nav
      className="bg-white/80 backdrop-blur-lg border-b border-neutral-150 sticky top-0 z-40"
      role={ariaRoles.NAVIGATION}
      aria-label="Main navigation"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-4 group"
            aria-label={`${settings?.[`siteName_${locale}` as keyof typeof settings] || 'NAMNGAM'} - ${t('home')}`}
          >
            <div className="relative w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg group-hover:shadow-pink-500/25 transition-all duration-300 group-hover:scale-105">
              <Image
                src={settings?.logo ? addCacheBusting(settings.logo) : "/Logo-namngam-white.svg"}
                alt={settings?.[`siteName_${locale}` as keyof typeof settings] || 'NAMNGAM'}
                width={56}
                height={56}
                className="object-contain p-2"
              />
            </div>
            <span className="text-2xl font-heading font-semibold gradient-text group-hover:scale-105 transition-transform duration-300">
              {settings?.[`siteName_${locale}` as keyof typeof settings] || 'NAMNGAM'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium transition-all duration-300 relative group ${
                  pathname === item.href
                    ? 'text-pink-500'
                    : 'text-neutral-600 hover:text-pink-500'
                }`}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-pink-400 transform transition-transform duration-300 ${
                  pathname === item.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} aria-hidden="true" />
              </Link>
            ))}
            <div className="ml-8">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 rounded-2xl hover:bg-pink-50 transition-colors duration-200"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-haspopup="true"
          >
            <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
            {isOpen ? <X size={24} className="text-pink-500" /> : <Menu size={24} className="text-neutral-600" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="md:hidden py-6 space-y-2 border-t border-neutral-150 mt-4"
            role={ariaRoles.MENU}
            aria-label="Mobile navigation menu"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-6 py-4 rounded-2xl transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-pink-50 text-pink-500 font-medium'
                    : 'text-neutral-600 hover:bg-pink-25 hover:text-pink-500'
                }`}
                onClick={() => setIsOpen(false)}
                role={ariaRoles.MENUITEM}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-6 pt-4">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
