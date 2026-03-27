import { Suspense } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import CarFilterForm from '@/components/forms/CarFilterForm/CarFilterForm';
import CarGrid from '@/components/sections/CarGrid/CarGrid';
import Loading from '@/components/ui/Loading/Loading';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Catálogo de Autos',
  description:
    'Explorá nuestro catálogo de autos usados en Mar del Plata. Encontrá tu próximo vehículo con las mejores condiciones de financiación.',
};

// Force dynamic rendering to ensure filters work
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchParams {
  brand?: string;
  minYear?: string;
  maxYear?: string;
  minPrice?: string;
  maxPrice?: string;
  maxMileage?: string;
  fuelType?: string;
  transmission?: string;
  page?: string;
}

async function getCars(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 12;

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: { in: ['available', 'reserved'] },
  };

  if (searchParams.brand) {
    where.brand = { contains: searchParams.brand, mode: 'insensitive' };
  }

  if (searchParams.minYear) {
    where.year = { ...(where.year as object || {}), gte: parseInt(searchParams.minYear, 10) };
  }

  if (searchParams.maxYear) {
    where.year = { ...(where.year as object || {}), lte: parseInt(searchParams.maxYear, 10) };
  }

  if (searchParams.minPrice) {
    where.price = { ...(where.price as object || {}), gte: parseInt(searchParams.minPrice, 10) };
  }

  if (searchParams.maxPrice) {
    where.price = { ...(where.price as object || {}), lte: parseInt(searchParams.maxPrice, 10) };
  }

  if (searchParams.maxMileage) {
    where.mileage = { ...(where.mileage as object || {}), lte: parseInt(searchParams.maxMileage, 10) };
  }

  if (searchParams.fuelType) {
    where.fuelType = searchParams.fuelType;
  }

  if (searchParams.transmission) {
    where.transmission = searchParams.transmission;
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
      cars: cars.map((car) => ({
        ...car,
        price: Number(car.price),
      })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Error fetching cars:', error);
    return {
      cars: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { cars, total, totalPages, currentPage } = await getCars(params);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Catálogo de Autos</h1>
          <p className={styles.subtitle}>
            {total} vehículos disponibles
          </p>
        </header>

        <div className={styles.filters}>
          <CarFilterForm />
        </div>

        <Suspense fallback={<Loading />}>
          <CarGrid cars={cars} />
        </Suspense>

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Paginación">
            <div className={styles.paginationInfo}>
              Página {currentPage} de {totalPages}
            </div>
            <div className={styles.paginationLinks}>
              {currentPage > 1 && (
                <a
                  href={`?page=${currentPage - 1}${params.brand ? `&brand=${params.brand}` : ''}`}
                  className={styles.paginationLink}
                >
                  Anterior
                </a>
              )}
              {currentPage < totalPages && (
                <a
                  href={`?page=${currentPage + 1}${params.brand ? `&brand=${params.brand}` : ''}`}
                  className={styles.paginationLink}
                >
                  Siguiente
                </a>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
