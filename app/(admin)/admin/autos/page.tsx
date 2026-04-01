import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminCars } from '@/app/actions/cars';
import Button from '@/components/ui/Button/Button';
import CarsTableWrapper from './CarsTableWrapper';
import CarsFilters from './CarsFilters';
import styles from './autos.module.css';

export const metadata: Metadata = {
  title: 'Gestionar Autos | Boston Automotores',
};

type CarStatus = 'available' | 'sold' | 'reserved';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    brand?: string;
    status?: string;
  }>;
}

export default async function AdminCarsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '20', 10);
  const sortBy = (params.sortBy || 'createdAt') as 'createdAt' | 'price' | 'year';
  const sortOrder = (params.sortOrder || 'desc') as 'asc' | 'desc';
  const brand = params.brand || '';
  const status = (params.status || '') as CarStatus | '';

  const result = await getAdminCars({
    page,
    limit,
    sortBy,
    sortOrder,
    brand: brand || undefined,
    status: status || undefined,
  });

  const cars = (result.cars || []).map((car) => ({
    ...car,
    price: Number(car.price),
    deletedAt: car.deletedAt ?? null,
    createdAt: car.createdAt instanceof Date ? car.createdAt : new Date(car.createdAt as string),
  }));
  const total = result.total || 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestionar Autos</h1>
          <p className={styles.subtitle}>
            {total} vehículo{total !== 1 ? 's' : ''} en inventario
          </p>
        </div>
        <Link href="/admin/autos/nuevo">
          <Button leftIcon="+">Nuevo Auto</Button>
        </Link>
      </header>

      <CarsFilters />

      <CarsTableWrapper
        cars={cars}
        total={total}
        page={page}
        limit={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        brand={brand}
        status={status}
      />
    </div>
  );
}
