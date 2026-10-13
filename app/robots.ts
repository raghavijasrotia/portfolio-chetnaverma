import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/rj-admin-portfolio', '/rj-admin-portfolio/', '/api/'],
      },
    ],
  };
}
