# Google Analytics Setup & SEO Optimization Guide

## Table of Contents
1. [Google Analytics Setup](#google-analytics-setup)
2. [SEO Optimization for Google Search](#seo-optimization-for-google-search)
3. [Sitemap & Search Console](#sitemap--search-console)
4. [Implementation Steps](#implementation-steps)

---

## Google Analytics Setup

### Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring" (or "Admin" → "Create Account")
4. Fill in account details:
   - **Account Name**: NAMNGAM Website
   - **Property Name**: NAMNGAM
   - **Business Category**: Retail/E-commerce
   - **Time Zone**: Your local timezone
5. Click "Create" and accept terms

### Step 2: Get Your Measurement ID

After creating the property, you'll get a **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Add to Your Application

#### Method 1: Environment Variable (Recommended)

Add to your `.env` file:
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Method 2: Direct Integration

Update your layout file to include Google Analytics:

```typescript
// src/app/layout.tsx
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### Step 4: Create Analytics Component

Create `src/components/analytics/GoogleAnalytics.tsx`:

```typescript
'use client';

import Script from 'next/script';

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}
```

### Step 5: Update Environment Variables

Update your `.env` file:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## SEO Optimization for Google Search

### 1. Meta Tags Implementation

Update your page components to include proper meta tags:

```typescript
// src/app/[locale]/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NAMNGAM - Quality Products & Beauty',
  description: 'Discover premium quality products at NAMNGAM. Shop our curated selection of beauty and lifestyle products with worldwide shipping.',
  keywords: 'namngam, beauty products, quality, shopping, e-commerce',
  openGraph: {
    title: 'NAMNGAM - Quality Products & Beauty',
    description: 'Discover premium quality products at NAMNGAM',
    url: 'https://yourdomain.com',
    siteName: 'NAMNGAM',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NAMNGAM Products',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NAMNGAM - Quality Products & Beauty',
    description: 'Discover premium quality products at NAMNGAM',
    images: ['https://yourdomain.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
```

### 2. Structured Data Implementation

Create `src/components/seo/StructuredData.tsx`:

```typescript
interface StructuredDataProps {
  type: 'WebPage' | 'Product' | 'Organization' | 'Article';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
```

### 3. Product Page SEO

```typescript
// Example for product pages
const productStructuredData = {
  name: 'Product Name',
  image: 'https://yourdomain.com/product-image.jpg',
  description: 'Product description',
  brand: 'NAMNGAM',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'USD',
    price: '29.99',
    availability: 'https://schema.org/InStock',
  },
};
```

---

## Sitemap & Search Console

### 1. Generate Sitemap

Create `src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Add dynamic routes for products and articles
    ...getProductUrls(),
    ...getArticleUrls(),
  ];
}

function getProductUrls() {
  // Fetch from your database
  return [
    {
      url: 'https://yourdomain.com/products/product-1',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}

function getArticleUrls() {
  // Fetch from your database
  return [
    {
      url: 'https://yourdomain.com/articles/article-1',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
```

### 2. Generate Robots.txt

Create `src/app/robots.ts`:

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/'],
      },
    ],
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

### 3. Google Search Console Setup

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click "Add Property"
3. Select "URL prefix" and enter your domain
4. Verify ownership:
   - **Option 1**: HTML file upload
   - **Option 2**: DNS record
   - **Option 3**: Google Analytics (if already set up)
5. Submit sitemap: `https://yourdomain.com/sitemap.xml`

---

## Implementation Steps

### Step 1: Update Environment Variables

```bash
# .env file
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 2: Create SEO Components

Create the necessary components:
1. `src/components/seo/StructuredData.tsx`
2. `src/components/analytics/GoogleAnalytics.tsx`
3. `src/app/sitemap.ts`
4. `src/app/robots.ts`

### Step 3: Update Layout

```typescript
// src/app/layout.tsx
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import StructuredData from '@/components/seo/StructuredData';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <StructuredData 
          type="Organization" 
          data={{
            name: 'NAMNGAM',
            url: 'https://yourdomain.com',
            logo: 'https://yourdomain.com/logo.png',
            description: 'Premium quality products and beauty items',
          }} 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

### Step 4: Add to Product Pages

```typescript
// src/app/[locale]/products/[slug]/page.tsx
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  return {
    title: `${product.name} - NAMNGAM`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  
  return (
    <div>
      <StructuredData 
        type="Product" 
        data={{
          name: product.name,
          image: product.image,
          description: product.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price,
          },
        }} 
      />
      {/* Product content */}
    </div>
  );
}
```

---

## Advanced SEO Features

### 1. Multilingual SEO

```typescript
// src/app/[locale]/sitemap.ts
import { MetadataRoute } from 'next';

const locales = ['en', 'lo', 'th', 'zh'];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourdomain.com';
  const urls: any[] = [];
  
  locales.forEach(locale => {
    urls.push(
      {
        url: `${baseUrl}/${locale}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/${locale}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      }
    );
  });
  
  return urls;
}
```

### 2. Performance Monitoring

```typescript
// src/lib/analytics.ts
export function trackPageView(page: string, title: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_title: title,
      page_location: page,
    });
  }
}

export function trackEvent(action: string, category: string, label?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
}
```

### 3. Core Web Vitals

```typescript
// src/app/layout.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getFCP(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }, []);

  return (
    <html>
      {/* ... */}
    </html>
  );
}
```

---

## Testing & Verification

### 1. Google Analytics Testing

1. Install Google Analytics Debugger extension
2. Navigate to your website
3. Check console for GA debug information
4. Verify real-time data in GA dashboard

### 2. SEO Testing Tools

1. **Google PageSpeed Insights**: `https://pagespeed.web.dev/`
2. **Rich Results Test**: `https://search.google.com/test/rich-results`
3. **Mobile-Friendly Test**: `https://search.google.com/test/mobile-friendly`

### 3. Search Console Monitoring

1. Check "Performance" report for keywords
2. Monitor "Coverage" for indexing issues
3. Review "Enhancements" for structured data

---

## Best Practices

### 1. Content Optimization
- Use descriptive titles (50-60 characters)
- Write compelling meta descriptions (150-160 characters)
- Use header tags (H1, H2, H3) properly
- Optimize images with alt text
- Create unique, valuable content

### 2. Technical SEO
- Ensure mobile responsiveness
- Improve page load speed
- Use HTTPS
- Create clean URL structure
- Implement internal linking

### 3. Local SEO
- Add business to Google My Business
- Include local keywords
- Get customer reviews
- Use local structured data

---

## Timeline

### Week 1: Setup
- [ ] Create Google Analytics account
- [ ] Implement GA tracking code
- [ ] Set up Search Console
- [ ] Submit sitemap

### Week 2: Optimization
- [ ] Add meta tags to all pages
- [ ] Implement structured data
- [ ] Optimize page speed
- [ ] Fix any SEO issues

### Week 3: Monitoring
- [ ] Monitor analytics data
- [ ] Check Search Console reports
- [ ] Track keyword rankings
- [ ] Make improvements based on data

This comprehensive guide will help you set up Google Analytics and optimize your website for Google search visibility.