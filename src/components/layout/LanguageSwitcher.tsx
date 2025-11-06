'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'lo', label: 'ລາວ', flag: '🇱🇦' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const currentLanguage = languages.find((lang) => lang.code === locale);

  const switchLanguage = (newLocale: string) => {
    // Get the pathname without the locale prefix
    let pathnameWithoutLocale = pathname;
    
    // Check if pathname starts with a locale
    const localePattern = /^\/(lo|th|zh|en)(\/|$)/;
    if (localePattern.test(pathname)) {
      pathnameWithoutLocale = pathname.replace(localePattern, '/') || '/';
    }
    
    // Ensure pathnameWithoutLocale starts with /
    if (!pathnameWithoutLocale.startsWith('/')) {
      pathnameWithoutLocale = '/' + pathnameWithoutLocale;
    }
    
    // Remove trailing slash to avoid double slashes
    pathnameWithoutLocale = pathnameWithoutLocale.replace(/\/$/, '');
    
    // Construct new path with new locale
    const newPathname = pathnameWithoutLocale === ''
      ? `/${newLocale}`
      : `/${newLocale}${pathnameWithoutLocale}`;
    
    router.push(newPathname);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-pink-500 transition-colors"
      >
        <Globe size={18} />
        <span className="text-sm font-medium">
          {currentLanguage?.flag} {currentLanguage?.label}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 hover:bg-pink-50 transition-colors flex items-center gap-3 ${
                  locale === lang.code ? 'bg-pink-50 text-pink-500' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-sm font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
