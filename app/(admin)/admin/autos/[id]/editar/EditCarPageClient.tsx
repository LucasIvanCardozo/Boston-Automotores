'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompleteCarForm from '@/components/forms/AdminCarForm/CompleteCarForm';
import { updateCar } from '@/app/actions/cars';
import { notifyLoading, updateNotification } from '@/lib/notifications';
import { setFlashNotification } from '@/lib/flash-notifications';
import type { CarCreateInput } from '@/lib/schemas/car';

interface EditCarPageClientProps {
  carId: string;
  initialData: Partial<CarCreateInput>;
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    const loadingId = notifyLoading('Guardando cambios', 'Por favor espere mientras se actualiza la información...');

    try {
      const result = await updateCar(carId, formData);

      if (!result.success) {
        updateNotification(loadingId, 'error', 'Error al actualizar', result.error || 'No se pudo actualizar el vehículo');
        setIsLoading(false);
        return;
      }

      // Set flash notification and redirect (like "nuevo" page does)
      setFlashNotification('success', `${carName} ha sido actualizado correctamente`);
      router.push('/admin/autos');
      router.refresh();
    } catch (err) {
      updateNotification(loadingId, 'error', 'Error inesperado', 'Por favor intenta de nuevo.');
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
