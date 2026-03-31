'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCar } from '@/app/actions/cars';
import { confirm, notifySuccess, notifyError, notifyWarning, notifyInfo } from '@/lib/notifications';
import { readFlashNotification } from '@/lib/flash-notifications';
import CarsTable from '@/components/admin/CarsTable/CarsTable';

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

interface CarsTableWrapperProps {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  brand: string;
  status: string;
}

export default function CarsTableWrapper({
  cars: initialCars,
  total: initialTotal,
  page,
  limit,
  sortBy,
  sortOrder,
  brand,
  status,
}: CarsTableWrapperProps) {
  const router = useRouter();
  const [cars, setCars] = useState(initialCars);
  const [total, setTotal] = useState(initialTotal);
  const hasShownFlash = useRef(false);

  // Sync with server-side data when props change (URL-driven navigation)
  useEffect(() => {
    setCars(initialCars);
    setTotal(initialTotal);
  }, [initialCars, initialTotal]);

  // Read flash notification once on mount
  useEffect(() => {
    if (hasShownFlash.current) return;
    hasShownFlash.current = true;

    const notification = readFlashNotification();
    if (!notification) return;

    const { type, title, message } = notification;
    switch (type) {
      case 'success': notifySuccess(title, message); break;
      case 'error':   notifyError(title, message);   break;
      case 'warning': notifyWarning(title, message); break;
      case 'info':    notifyInfo(title, message);    break;
    }
  }, []);

  const handleDeleteCar = async (car: Car) => {
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
      // Optimistic update — remove from local state immediately
      setCars((prev) => prev.filter((c) => c.id !== car.id));
      setTotal((prev) => prev - 1);
      notifySuccess('Éxito', `${car.brand} ${car.model} ha sido eliminado correctamente`);
    } else {
      notifyError('Error al eliminar', result.error || 'No se pudo eliminar el vehículo.');
    }
  };

  const buildParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const current = { page: String(page), limit: String(limit), sortBy, sortOrder, brand, status };
    const merged = { ...current, ...updates };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return params.toString();
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/admin/autos?${buildParams({ page: String(newPage) })}`);
  };

  const handlePageSizeChange = (newLimit: number) => {
    router.push(`/admin/autos?${buildParams({ limit: String(newLimit), page: '1' })}`);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    router.push(`/admin/autos?${buildParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: '1' })}`);
  };

  return (
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
    />
  );
}
