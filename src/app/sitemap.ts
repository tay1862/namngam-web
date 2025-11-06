import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';
const locales = ['en', 'lo', 'th', 'zh'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/products',
    '/articles',
    '/contact',
    '/faq',
    '/tags',
  ];

  // Generate static page URLs for all locales
  const staticUrls = staticPages.flatMap(page => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
    }))
  );

  // Get dynamic data from database
  try {
    const [products, articles, tags] = await Promise.all([
      prisma.product.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.article.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.tag.findMany({
        select: { slug: true, createdAt: true },
      }),
    ]);

    // Generate product URLs
    const productUrls = products.flatMap(product =>
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }))
    );

    // Generate article URLs
    const articleUrls = articles.flatMap(article =>
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/articles/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    );

    // Generate tag URLs
    const tagUrls = tags.flatMap(tag =>
      locales.map(locale => ({
        url: `${baseUrl}/${locale}/tags/${tag.slug}`,
        lastModified: tag.createdAt,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    );

    return [...staticUrls, ...productUrls, ...articleUrls, ...tagUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticUrls;
  }
}
