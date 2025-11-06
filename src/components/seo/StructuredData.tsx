interface StructuredDataProps {
  type: 'WebPage' | 'Product' | 'Organization' | 'Article' | 'BreadcrumbList';
  data: any;
}

// Export specific components for different structured data types
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

// Export specific components for convenience
export function PageStructuredData(data: any) {
  return <StructuredData type="WebPage" data={data} />;
}

export function ProductStructuredData(data: any) {
  return <StructuredData type="Product" data={data} />;
}

export function ArticleStructuredData(data: any) {
  return <StructuredData type="Article" data={data} />;
}

export function BreadcrumbStructuredData(data: any) {
  return <StructuredData type="BreadcrumbList" data={data} />;
}

export function OrganizationStructuredData(data: any) {
  return <StructuredData type="Organization" data={data} />;
}