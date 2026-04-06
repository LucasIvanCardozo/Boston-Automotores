import { MetadataRoute } from 'next';
import { getCarIdsForSitemap } from '@/lib/data/cars';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bostonautomotores.com.ar';
  
  // Get all published cars for dynamic routes
  const cars = await getCarIdsForSitemap();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/vende-tu-auto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic car detail routes
  const carRoutes: MetadataRoute.Sitemap = cars.map((car) => ({
    url: `${baseUrl}/catalogo/${car.id}`,
    lastModified: car.updatedAt,
    changeFrequency: 'weekly',
    priority: car.status === 'available' ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...carRoutes];
}
