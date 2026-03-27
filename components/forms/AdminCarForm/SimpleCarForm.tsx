'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCar } from '@/app/actions/cars';
import styles from './AdminCarForm.module.css';

export default function SimpleCarForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    console.log('Submitting car form...');
    console.log('Brand:', formData.get('brand'));
    console.log('Model:', formData.get('model'));
    
    try {
      const result = await createCar(formData);
      console.log('Result:', result);
      
      if (result.success) {
        router.push('/admin/autos');
        router.refresh();
      } else {
        setError(result.error || 'Error al crear');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Error inesperado');
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div style={{ 
          padding: '12px', 
          background: '#fee', 
          color: '#c00', 
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <div className={styles.grid}>
        <div>
          <label>Marca *</label>
          <input 
            name="brand" 
            required 
            placeholder="Ej: Toyota"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label>Modelo *</label>
          <input 
            name="model" 
            required 
            placeholder="Ej: Corolla"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label>Año *</label>
          <select 
            name="year" 
            defaultValue={currentYear}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div>
          <label>Precio (USD) *</label>
          <input 
            name="price" 
            type="number" 
            required 
            defaultValue="0"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label>Kilometraje *</label>
          <input 
            name="mileage" 
            type="number" 
            required 
            defaultValue="0"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <label>Combustible</label>
          <select 
            name="fuelType"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="nafta">Nafta</option>
            <option value="diesel">Diesel</option>
            <option value="electrico">Eléctrico</option>
            <option value="hibrido">Híbrido</option>
            <option value="gnc">GNC</option>
          </select>
        </div>

        <div>
          <label>Transmisión</label>
          <select 
            name="transmission"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="manual">Manual</option>
            <option value="automatica">Automática</option>
            <option value="cvt">CVT</option>
          </select>
        </div>

        <div>
          <label>Estado</label>
          <select 
            name="status"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="available">Disponible</option>
            <option value="sold">Vendido</option>
            <option value="reserved">Reservado</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label>
          <input type="checkbox" name="featured" value="true" />
          Destacado
        </label>
      </div>

      <div style={{ marginTop: '24px' }}>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '12px 32px',
            background: isLoading ? '#ccc' : '#0F6BBE',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Guardando...' : 'Crear Vehículo'}
        </button>
      </div>
    </form>
  );
}
