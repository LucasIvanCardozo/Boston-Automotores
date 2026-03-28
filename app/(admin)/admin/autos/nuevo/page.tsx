'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompleteCarForm from '@/components/forms/AdminCarForm/CompleteCarForm';
import { createCar } from '@/app/actions/cars';
import { notifyError, notifyLoading, updateNotification } from '@/lib/notifications';
import { setFlashNotification } from '@/lib/flash-notifications';

export default function NuevoAutoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    
    const loadingId = notifyLoading('Creando vehículo', 'Por favor espere mientras se guarda la información...');

    try {
      const result = await createCar(formData);

      if (!result.success) {
        updateNotification(loadingId, 'error', 'Error al crear', result.error || 'No se pudo crear el vehículo');
        setIsLoading(false);
        return;
      }

      // Set flash notification and redirect to list page
      const carData = result.data as { id: string; brand: string; model: string } | undefined;
      if (carData) {
        setFlashNotification('success', `${carData.brand} ${carData.model} ha sido creado correctamente`);
      } else {
        setFlashNotification('success', 'Vehículo creado correctamente');
      }
      
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
          Nuevo Vehículo
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          Complete todos los campos para agregar un nuevo vehículo al inventario.
        </p>
      </header>

      <CompleteCarForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
