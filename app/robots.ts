import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/chetna-admin-portfolio', '/chetna-admin-portfolio/', '/rj-admin-portfolio', '/api/'],
      },
    ],
  };
}
