import { cache } from 'react';
import { prisma } from '@/lib/prisma';

/**
 * Get featured cars for the homepage.
 * Cached per request using React.cache() — safe to call from both
 * generateMetadata and the page component without double-querying.
 */
export const getFeaturedCars = cache(async () => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        featured: true,
        deletedAt: null,
        status: 'available',
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    return cars.map((car) => ({
      ...car,
      price: Number(car.price),
    }));
  } catch (error) {
    console.error('[getFeaturedCars] Error:', error);
    return [];
  }
});

/**
 * Get a single public car by ID.
 * Cached per request — safe to call from generateMetadata AND the page.
 */
export const getPublicCar = cache(async (id: string) => {
  try {
    const car = await prisma.car.findUnique({
      where: { id, deletedAt: null },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        technicalSheet: true,
      },
    });

    if (!car) return null;

    return {
      ...car,
      price: Number(car.price),
    };
  } catch (error) {
    console.error('[getPublicCar] Error:', error);
    return null;
  }
});

/**
 * Get related cars for a car detail page.
 * First tries same brand, falls back to recent cars.
 */
export const getRelatedCars = cache(async (currentCarId: string, brand: string) => {
  try {
    // First try: same brand
    let cars = await prisma.car.findMany({
      where: {
        deletedAt: null,
        status: { in: ['available', 'reserved'] },
        id: { not: currentCarId },
        brand,
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    // Fallback: fill remaining slots with other available cars
    if (cars.length < 4) {
      const existingIds = [currentCarId, ...cars.map((c) => c.id)];
      const fallback = await prisma.car.findMany({
        where: {
          deletedAt: null,
          status: { in: ['available', 'reserved'] },
          id: { notIn: existingIds },
        },
        orderBy: { createdAt: 'desc' },
        take: 4 - cars.length,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      });
      cars = [...cars, ...fallback];
    }

    return cars.map((car) => ({
      ...car,
      price: Number(car.price),
    }));
  } catch (error) {
    console.error('[getRelatedCars] Error:', error);
    return [];
  }
});

interface GetCatalogCarsOptions {
  brand?: string;
  maxPrice?: string;
  maxMileage?: string;
  page?: string;
}

/**
 * Get paginated cars for the public catalog page.
 */
export async function getCatalogCars(params: GetCatalogCarsOptions) {
  const page = parseInt(params.page || '1', 10);
  const limit = 12;

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: { in: ['available', 'reserved'] },
  };

  if (params.brand) {
    where.brand = { contains: params.brand, mode: 'insensitive' };
  }

  if (params.maxPrice) {
    where.price = { lte: parseInt(params.maxPrice, 10) };
  }

  if (params.maxMileage) {
    where.mileage = { lte: parseInt(params.maxMileage, 10) };
  }

  try {
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.car.count({ where }),
    ]);

    return {
      cars: cars.map((car) => ({ ...car, price: Number(car.price) })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('[getCatalogCars] Error:', error);
    return { cars: [], total: 0, totalPages: 0, currentPage: 1 };
  }
}

/**
 * Get distinct available brands for the catalog filter.
 */
export async function getAvailableBrands(): Promise<string[]> {
  try {
    const cars = await prisma.car.findMany({
      where: {
        deletedAt: null,
        status: { in: ['available', 'reserved'] },
      },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });

    return cars.map((car) => car.brand);
  } catch (error) {
    console.error('[getAvailableBrands] Error:', error);
    return [];
  }
}

/**
 * Get all available car IDs for static generation.
 * Uses React.cache() to avoid double-fetching between generateStaticParams
 * and the page component.
 */
export const getAllAvailableCarIds = cache(async (): Promise<string[]> => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        deletedAt: null,
        status: 'available',
      },
      select: { id: true },
      orderBy: { createdAt: 'desc' },
    });

    return cars.map((car) => car.id);
  } catch (error) {
    console.error('[getAllAvailableCarIds] Error:', error);
    return [];
  }
});

export interface CarIdForSitemap {
  id: string;
  updatedAt: Date;
  status: string;
}

/**
 * Get car IDs with timestamps for sitemap generation.
 * Uses React.cache() to avoid double-fetching between sitemap generation
 * and other page components.
 * Filters: deletedAt = null, status in ['available', 'reserved']
 */
export const getCarIdsForSitemap = cache(async (): Promise<CarIdForSitemap[]> => {
  try {
    const cars = await prisma.car.findMany({
      where: {
        deletedAt: null,
        status: { in: ['available', 'reserved'] },
      },
      select: {
        id: true,
        updatedAt: true,
        status: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return cars;
  } catch (error) {
    console.error('[getCarIdsForSitemap] Error:', error);
    return [];
  }
});
