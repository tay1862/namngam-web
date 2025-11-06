import { getTranslations } from 'next-intl/server';
import ProductsList from '@/components/products/ProductsList';
import { Loading } from '@/components/shared/Loading';
import DynamicBackground from '@/components/shared/DynamicBackground';
import { PageStructuredData } from '@/components/seo/StructuredData';
import Head from 'next/head';

export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products?published=true`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function ProductsPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'product' });

  const breadcrumbs = [
    { name: t('nav.home'), url: `/${params.locale}` },
    { name: t('product.allProducts'), url: `/${params.locale}/products` },
  ];

  return (
    <>
      <Head>
        <title>{t('allProducts')} | NAMNGAM</title>
        <meta name="description" content={t('description')} />
        <meta property="og:title" content={t('allProducts')} />
        <meta property="og:description" content={t('description')} />
        <meta property="og:url" content={`${process.env.NEXTAUTH_URL}/${params.locale}/products`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('allProducts')} />
        <meta name="twitter:description" content={t('description')} />
        
        {/* Structured Data */}
        <PageStructuredData
          title={t('allProducts')}
          description={t('description')}
          breadcrumbs={breadcrumbs}
          locale={params.locale}
        />
      </Head>
      <div className="min-h-screen">
      <DynamicBackground type="productsBg" fallbackClass="bg-gradient-to-br from-pink-50 via-white to-pink-50">
        <section className="py-16">
          <div className="container-custom">
            <h1 className="text-5xl font-heading font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              {t('allProducts')}
            </h1>
            <p className="text-center text-gray-600 mb-12">
              {t('description')}
            </p>

            <ProductsListWrapper locale={params.locale} />
          </div>
        </section>
      </DynamicBackground>
      </div>
    </>
  );
}

async function ProductsListWrapper({ locale }: { locale: string }) {
  const products = await getProducts();
  
  if (products.length === 0) {
    return <Loading message="กำลังโหลดสินค้า..." />;
  }
  
  return <ProductsList products={products} locale={locale} />;
}
