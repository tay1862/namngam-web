import Head from 'next/head';

interface StructuredDataProps {
  type: 'Product' | 'Article' | 'BreadcrumbList' | 'Organization' | 'WebSite';
  data: any;
  locale?: string;
}

export default function StructuredData({ type, data, locale = 'en' }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://namngam.com';
    
    switch (type) {
      case 'Product':
        return {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: data.name,
          description: data.description || data.excerpt,
          image: data.featuredImage ? [data.featuredImage] : [],
          brand: {
            '@type': 'Brand',
            name: 'NAMNGAM',
          },
          category: data.category?.name || '',
          offers: data.price ? {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'LAK', // Lao Kip
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: 'NAMNGAM',
              url: baseUrl,
            },
          } : undefined,
          url: `${baseUrl}/${locale}/products/${data.slug || data.id}`,
        };

      case 'Article':
        return {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: data.title,
          description: data.excerpt,
          image: data.featuredImage ? [data.featuredImage] : [],
          datePublished: data.publishedAt || data.createdAt,
          dateModified: data.updatedAt || data.publishedAt || data.createdAt,
          author: {
            '@type': 'Person',
            name: data.author?.name || data.createdBy?.name || 'NAMNGAM Team',
          },
          publisher: {
            '@type': 'Organization',
            name: 'NAMNGAM',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/Logo-namngam-white.svg`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/${locale}/articles/${data.slug}`,
          },
          url: `${baseUrl}/${locale}/articles/${data.slug}`,
          ...(data.tags?.length > 0 && {
            keywords: data.tags.map((tag: any) => tag.name || tag).join(', '),
          }),
        };

      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.url}`,
          })),
        };

      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'NAMNGAM',
          description: data.description || 'NAMNGAM ORIGINAL - Your trusted source for quality products',
          url: baseUrl,
          logo: `${baseUrl}/Logo-namngam-white.svg`,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: data.phone || '+856-20-12345678',
            contactType: 'customer service',
            availableLanguage: ['Lao', 'Thai', 'Chinese', 'English'],
          },
          sameAs: [
            data.facebook || 'https://www.facebook.com/namngam',
            data.instagram || 'https://www.instagram.com/namngam',
          ].filter(Boolean),
          address: data.address ? {
            '@type': 'PostalAddress',
            streetAddress: data.address.street,
            addressLocality: data.address.city,
            addressCountry: data.address.country || 'LA',
          } : undefined,
        };

      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'NAMNGAM',
          description: data.description || 'NAMNGAM ORIGINAL - Your trusted source for quality products',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/${locale}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
          publisher: {
            '@type': 'Organization',
            name: 'NAMNGAM',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/Logo-namngam-white.svg`,
            },
          },
          inLanguage: locale === 'lo' ? 'lo-LA' : locale === 'th' ? 'th-TH' : locale === 'zh' ? 'zh-CN' : 'en-US',
        };

      default:
        return {};
    }
  };

  const structuredData = generateStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

// Helper component for multiple structured data objects
interface MultipleStructuredDataProps {
  data: Array<{
    type: StructuredDataProps['type'];
    data: any;
  }>;
  locale?: string;
}

export function MultipleStructuredData({ data, locale = 'en' }: MultipleStructuredDataProps) {
  return (
    <>
      {data.map((item, index) => (
        <StructuredData
          key={index}
          type={item.type}
          data={item.data}
          locale={locale}
        />
      ))}
    </>
  );
}

// Specific components for common use cases
interface ProductStructuredDataProps {
  product: any;
  locale?: string;
}

export function ProductStructuredData({ product, locale }: ProductStructuredDataProps) {
  return <StructuredData type="Product" data={product} locale={locale} />;
}

interface ArticleStructuredDataProps {
  article: any;
  locale?: string;
}

export function ArticleStructuredData({ article, locale }: ArticleStructuredDataProps) {
  return <StructuredData type="Article" data={article} locale={locale} />;
}

interface BreadcrumbStructuredDataProps {
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>;
  locale?: string;
}

export function BreadcrumbStructuredData({ breadcrumbs, locale }: BreadcrumbStructuredDataProps) {
  return <StructuredData type="BreadcrumbList" data={breadcrumbs} locale={locale} />;
}

interface PageStructuredDataProps {
  title?: string;
  description?: string;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  locale?: string;
  organization?: any;
}

export function PageStructuredData({ 
  title, 
  description, 
  breadcrumbs, 
  locale,
  organization 
}: PageStructuredDataProps) {
  const structuredDataArray = [
    {
      type: 'WebSite' as const,
      data: { title, description },
    },
    ...(organization ? [{
      type: 'Organization' as const,
      data: organization,
    }] : []),
    ...(breadcrumbs ? [{
      type: 'BreadcrumbList' as const,
      data: breadcrumbs,
    }] : []),
  ];

  return <MultipleStructuredData data={structuredDataArray} locale={locale} />;
}