import { Locale } from '@/i18n';

export function getLocalizedField<T extends Record<string, any>>(
  obj: T,
  fieldName: string,
  locale: Locale
): string {
  const key = `${fieldName}_${locale}` as keyof T;
  const fallbackKey = `${fieldName}_lo` as keyof T;
  return (obj[key] as string) || (obj[fallbackKey] as string) || '';
}

export function getLocalizedContent<T extends Record<string, any>>(
  obj: T,
  locale: Locale
): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.keys(obj).forEach((key) => {
    if (key.endsWith(`_${locale}`)) {
      const fieldName = key.replace(`_${locale}`, '');
      result[fieldName] = obj[key];
    }
  });
  
  return result;
}
