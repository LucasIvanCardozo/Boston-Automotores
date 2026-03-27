'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompleteCarForm from '@/components/forms/AdminCarForm/CompleteCarForm';
import { updateCar } from '@/app/actions/cars';
import type { CarCreateInput, CarSpecs } from '@/lib/schemas/car';

interface EditCarPageClientProps {
  carId: string;
  initialData: Partial<CarCreateInput & { specs: CarSpecs | null }>;
  existingImages: Array<{ id: string; url: string; publicId: string; order: number; width?: number; height?: number }>;
  existingTechnicalSheet?: { publicId: string; url: string; filename: string };
  carName: string;
}

export default function EditCarPageClient({
  carId,
  initialData,
  existingImages,
  existingTechnicalSheet,
  carName,
}: EditCarPageClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateCar(carId, formData);

      if (!result.success) {
        setError(result.error || 'Error al actualizar el vehículo');
        setIsLoading(false);
        return;
      }

      router.push('/admin/autos');
      router.refresh();
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', margin: 0 }}>
          Editar Vehículo
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          {carName}
        </p>
      </header>

      {error && (
        <div style={{
          padding: 'var(--space-4)',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          marginBottom: 'var(--space-6)',
        }}>
          {error}
        </div>
      )}

      <CompleteCarForm
        carId={carId}
        initialData={initialData}
        onSubmit={handleSubmit}
        existingImages={existingImages}
        existingTechnicalSheet={existingTechnicalSheet}
        isLoading={isLoading}
      />
    </div>
  );
}
