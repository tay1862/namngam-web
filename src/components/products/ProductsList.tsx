'use client';

import { useTranslations } from 'next-intl';
import { getLocalizedField } from '@/lib/i18n-helpers';
import { Locale } from '@/i18n';
import Image from 'next/image';
import Head from 'next/head';
import { ProductStructuredData } from '@/components/seo/StructuredData';

interface ProductsListProps {
  products: any[];
  locale: string;
}

export default function ProductsList({ products, locale }: ProductsListProps) {
  const t = useTranslations();

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🛍️</div>
        <p className="text-xl text-gray-600">{t('product.noProducts')}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        {products.map((product: any) => {
          const name = getLocalizedField(product, 'name', locale as Locale);
          const description = getLocalizedField(product, 'description', locale as Locale) ||
                           getLocalizedField(product, 'excerpt', locale as Locale);
          
          return (
            <ProductStructuredData
              key={`structured-${product.id}`}
              product={{
                ...product,
                name,
                description,
              }}
              locale={locale}
            />
          );
        })}
      </Head>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product: any) => {
          const name = getLocalizedField(product, 'name', locale as Locale);
          const categoryName = getLocalizedField(product.category, 'name', locale as Locale);
          const price = product.price ? Number(product.price) : 0;

          return (
            <div key={product.id} className="card group cursor-pointer">
            {product.featuredImage ? (
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
                <Image
                  src={product.featuredImage}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 mb-4 flex items-center justify-center text-6xl">
                🎁
              </div>
            )}
            <span className="text-xs text-pink-500 font-medium mb-2 block">
              {categoryName}
            </span>
            <h3 className="font-semibold text-lg mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">
              {name}
            </h3>
            {price > 0 && (
              <p className="text-pink-500 font-bold mb-4">
                ₭{price.toLocaleString()}
              </p>
            )}
            <a
              href={`https://wa.me/8562012345678?text=${t('product.whatsappMessage')}: ${name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full btn btn-primary text-sm text-center"
            >
              {t('product.contactUs')}
            </a>
            </div>
          );
        })}
      </div>
    </>
  );
}
