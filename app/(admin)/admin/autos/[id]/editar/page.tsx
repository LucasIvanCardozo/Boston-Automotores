import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminCar, updateCar } from '@/app/actions/cars';
import EditCarForm from './EditCarForm';

export const metadata: Metadata = {
  title: 'Editar Vehículo | Boston Automotores',
  description: 'Editar información del vehículo',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCarPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getAdminCar(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const car = result.data;

  // Transform the car data to match the form expected format
  const initialData = {
    brand: car.brand,
    model: car.model,
    year: car.year,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    price: Number(car.price as any),
    mileage: car.mileage,
    fuelType: car.fuelType as 'nafta' | 'diesel' | 'electrico' | 'hibrido' | 'gnc',
    transmission: car.transmission as 'manual' | 'automatica' | 'cvt',
    status: car.status as 'available' | 'sold' | 'reserved',
    featured: car.featured,
    description: car.description || '',
    features: car.features || [],
  };

  return (
    <div>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', margin: 0 }}>
          Editar Vehículo
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          {car.brand} {car.model} ({car.year})
        </p>
      </header>

      <EditCarForm carId={id} initialData={initialData} />
    </div>
  );
}
