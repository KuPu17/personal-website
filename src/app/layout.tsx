import type { Metadata } from 'next';
import { Kirang_Haerang, Ribeye_Marrow } from 'next/font/google';
import './globals.css';

const ribeyeMarrow = Ribeye_Marrow({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ribeye-marrow',
  display: 'swap',
});

const kirangHaerang = Kirang_Haerang({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-kirang-haerang',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s · Kunchit Pujari',
    default: 'Kunchit Pujari',
  },
  description: 'Interactive portfolio and private command center.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ribeyeMarrow.variable} ${kirangHaerang.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
