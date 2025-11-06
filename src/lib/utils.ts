import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function formatPrice(price: number, currency: string = 'LAK'): string {
  const currencySymbols: Record<string, string> = {
    LAK: '₭',
    THB: '฿',
    USD: '$',
    CNY: '¥',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${price.toLocaleString()}`;
}

export function truncate(text: string, length: number = 150): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
