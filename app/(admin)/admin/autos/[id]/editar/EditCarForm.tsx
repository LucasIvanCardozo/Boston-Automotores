'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminCarForm from '@/components/forms/AdminCarForm/AdminCarForm';
import { updateCar } from '@/app/actions/cars';
import type { CarCreateInput } from '@/lib/schemas/car';

interface EditCarFormProps {
  carId: string;
  initialData: Partial<CarCreateInput>;
}

export default function EditCarForm({ carId, initialData }: EditCarFormProps) {
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

      // Redirect to the cars list on success
      router.push('/admin/autos');
      router.refresh();
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div>
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

      <AdminCarForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
