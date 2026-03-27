'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleCarForm from '@/components/forms/AdminCarForm/SimpleCarForm';
import { createCar } from '@/app/actions/cars';

export default function NuevoAutoPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createCar(formData);

      if (!result.success) {
        setError(result.error || 'Error al crear el vehículo');
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
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', margin: 0 }}>
          Nuevo Vehículo
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          Complete todos los campos para agregar un nuevo vehículo al inventario.
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

      <SimpleCarForm />
    </div>
  );
}
