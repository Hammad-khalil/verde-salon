import { MetadataRoute } from 'next';

/**
 * Generates the sitemap for Verde Salon.
 * Note: For a fully dynamic sitemap with client-side Firestore constraints,
 * this file serves as the static entry point for major routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://verdesalon.com';

  const staticRoutes = [
    '',
    '/services',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    // Dynamic blog posts and services would typically be fetched here via REST API 
    // if using server-side generation, but we maintain the static core for SEO visibility.
  ];
}
