import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NAMNGAM ORIGINAL | Quality & Beauty',
    template: '%s | NAMNGAM',
  },
  description: 'NAMNGAM ORIGINAL - Your trusted source for quality products',
  keywords: ['namngam', 'products', 'quality', 'online shop', 'laos'],
  authors: [{ name: 'NAMNGAM' }],
  creator: 'NAMNGAM',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'lo_LA',
    alternateLocale: ['th_TH', 'zh_CN', 'en_US'],
    siteName: 'NAMNGAM ORIGINAL',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
