'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

export default function SkipLinks() {
  const t = useTranslations('accessibility');
  const locale = useLocale();

  return (
    <div className="skip-links">
      <a 
        href="#main-content" 
        className="focus:not-sr-only"
      >
        {t('skipToMain') || 'Skip to main content'}
      </a>
      <a 
        href="#navigation" 
        className="focus:not-sr-only"
      >
        {t('skipToNav') || 'Skip to navigation'}
      </a>
    </div>
  );
}