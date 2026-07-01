import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourdomain.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block all private routes from indexing
        disallow: ['/dashboard', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
