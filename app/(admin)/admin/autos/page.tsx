'use client';

import { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAdminCars, deleteCar } from '@/app/actions/cars';
import { confirm, notifySuccess, notifyError, notifyWarning, notifyInfo } from '@/lib/notifications';
import { setFlashNotification, readFlashNotification } from '@/lib/flash-notifications';
import Button from '@/components/ui/Button/Button';
import CarsTable from '@/components/admin/CarsTable/CarsTable';
import styles from './autos.module.css';

type CarStatus = 'available' | 'sold' | 'reserved';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: CarStatus;
  featured: boolean;
  deletedAt: Date | null;
  images: { url: string }[];
  createdAt: Date;
}

const statusOptions: { value: CarStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'reserved', label: 'Reservado' },
];

export default function AdminCarsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const brand = searchParams.get('brand') || '';
  const status = (searchParams.get('status') || '') as CarStatus | '';

  const loadCars = useCallback(async () => {
    setLoading(true);
    const result = await getAdminCars({
      page,
      limit,
      sortBy: sortBy as 'createdAt' | 'price' | 'year',
      sortOrder,
      brand: brand || undefined,
      status: status || undefined,
    });

    setCars(
      (result.cars || []).map((car: Record<string, unknown>) => ({
        ...car,
        price: Number(car.price),
      })) as Car[]
    );
    setTotal(result.total || 0);
    setLoading(false);
  }, [page, limit, sortBy, sortOrder, brand, status]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/admin/autos?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams({ page: newPage.toString() });
    },
    [updateSearchParams]
  );

  const handlePageSizeChange = useCallback(
    (newLimit: number) => {
      updateSearchParams({ limit: newLimit.toString(), page: '1' });
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
      updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: '1' });
    },
    [updateSearchParams]
  );

  // Check for flash notifications on mount - using in-memory store
  const hasShownFlashNotification = useRef(false);
  
  useEffect(() => {
    // Only run once per mount
    if (hasShownFlashNotification.current) return;
    hasShownFlashNotification.current = true;

    // Read and clear the flash notification (sync, instant)
    const notification = readFlashNotification();
    
    if (!notification) return;
    
    const { type, title, message } = notification;

    switch (type) {
      case 'success':
        notifySuccess(title, message);
        break;
      case 'error':
        notifyError(title, message);
        break;
      case 'warning':
        notifyWarning(title, message);
        break;
      case 'info':
        notifyInfo(title, message);
        break;
    }
    // No URL params to clear - the in-memory store handles it
  }, []); // Empty deps - only run on mount

  const handleDeleteCar = useCallback(
    async (car: Car) => {
      const isConfirmed = await confirm({
        title: 'Eliminar vehículo',
        description: `¿Estás seguro de que deseas eliminar el ${car.brand} ${car.model}? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'error',
      });

      if (!isConfirmed) return;

      const result = await deleteCar(car.id);
      if (result.success) {
        // Optimistically remove from local state - avoids re-renders from loadCars()
        // Using functional update so we don't need cars/setCars in dependency array
        setCars((prevCars) => prevCars.filter((c) => c.id !== car.id));
        setTotal((prevTotal) => prevTotal - 1);

        // Show notification immediately - no setTimeout needed
        // Direct state update means no React reconciliation chaos
        notifySuccess('Éxito', `${car.brand} ${car.model} ha sido eliminado correctamente`);
      } else {
        notifyError('Error al eliminar', result.error || 'No se pudo eliminar el vehículo.');
      }
    },
    [] // No dependencies needed - we use functional state updates
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        updateSearchParams({ [key]: value || undefined, page: '1' });
      });
    },
    [updateSearchParams]
  );

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

      <div className={styles.filters}>
        <input
          type="text"
          name="brand"
          placeholder="Buscar por marca..."
          defaultValue={brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className={styles.filterInput}
        />
        <select
          name="status"
          defaultValue={status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.filterSelect}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <CarsTable
        data={cars}
        totalCount={total}
        page={page}
        pageSize={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
        onDeleteCar={handleDeleteCar}
        isLoading={loading}
      />
    </div>
  );
}
