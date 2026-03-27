'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carCreateSchema, carUpdateSchema, type CarCreateInput } from '@/lib/schemas/car';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Button from '@/components/ui/Button/Button';
import styles from './AdminCarForm.module.css';

type FuelType = 'nafta' | 'diesel' | 'electrico' | 'hibrido' | 'gnc';
type Transmission = 'manual' | 'automatica' | 'cvt';
type CarStatus = 'available' | 'sold' | 'reserved';

interface AdminCarFormData {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  status: CarStatus;
  featured: boolean;
  description?: string;
  features: { value: string }[];
}

interface AdminCarFormProps {
  initialData?: Partial<CarCreateInput>;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

const fuelTypeOptions = [
  { value: 'nafta', label: 'Nafta' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'gnc', label: 'GNC' },
];

const transmissionOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatica', label: 'Automática' },
  { value: 'cvt', label: 'CVT' },
];

const statusOptions = [
  { value: 'available', label: 'Disponible' },
  { value: 'sold', label: 'Vendido' },
  { value: 'reserved', label: 'Reservado' },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}));

export default function AdminCarForm({
  initialData,
  onSubmit,
  isLoading = false,
}: AdminCarFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AdminCarFormData>({
    resolver: zodResolver(initialData ? carUpdateSchema : carCreateSchema) as any,
    defaultValues: {
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      year: initialData?.year || currentYear,
      price: initialData?.price || 0,
      mileage: initialData?.mileage || 0,
      fuelType: initialData?.fuelType || 'nafta',
      transmission: initialData?.transmission || 'automatica',
      status: initialData?.status || 'available',
      featured: initialData?.featured || false,
      description: initialData?.description || '',
      features: (initialData?.features || []).map(f => ({ value: f })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const handleFormSubmit = async (data: AdminCarFormData) => {
    console.log('Form data:', data);
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'features') {
        // Skip features for now
      } else if (typeof value === 'boolean') {
        formData.append(key, String(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    console.log('Submitting form...');
    await onSubmit(formData);
  };

  // Debug: log errors
  console.log('Form errors:', errors);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, (err) => console.log('Validation failed:', err))} className={styles.form}>
      {/* Basic Information */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Información Básica</h3>
        
        <div className={styles.grid}>
          <Input
            label="Marca"
            {...register('brand')}
            error={errors.brand?.message}
            placeholder="Ej: Toyota"
          />
          
          <Input
            label="Modelo"
            {...register('model')}
            error={errors.model?.message}
            placeholder="Ej: Corolla"
          />
          
          <Select
            label="Año"
            options={yearOptions}
            {...register('year', { valueAsNumber: true })}
            error={errors.year?.message}
          />
          
          <Input
            label="Precio (USD)"
            type="number"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="Ej: 25000"
          />
          
          <Input
            label="Kilometraje"
            type="number"
            {...register('mileage', { valueAsNumber: true })}
            error={errors.mileage?.message}
            placeholder="Ej: 50000"
          />
        </div>
      </section>

      {/* Technical Specifications */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Especificaciones Técnicas</h3>
        
        <div className={styles.grid}>
          <Select
            label="Tipo de Combustible"
            options={fuelTypeOptions}
            {...register('fuelType')}
            error={errors.fuelType?.message}
          />
          
          <Select
            label="Transmisión"
            options={transmissionOptions}
            {...register('transmission')}
            error={errors.transmission?.message}
          />
          
          <Select
            label="Estado"
            options={statusOptions}
            {...register('status')}
            error={errors.status?.message}
          />
          
          <div className={styles.checkbox}>
            <input
              type="checkbox"
              id="featured"
              {...register('featured')}
            />
            <label htmlFor="featured">Vehículo Destacado</label>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Descripción</h3>
        
        <div className={styles.textareaWrapper}>
          <textarea
            id="description"
            className={styles.textarea}
            placeholder="Describe las características principales del vehículo..."
            {...register('description')}
            rows={4}
          />
          {errors.description && (
            <span className={styles.error}>{errors.description.message}</span>
          )}
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Características</h3>
        
        <div className={styles.featuresList}>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.featureItem}>
              <Input
                {...register(`features.${index}.value`)}
                placeholder="Ej: Aire acondicionado"
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => remove(index)}
              >
                ✕
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ value: '' })}
          >
            + Agregar Característica
          </Button>
        </div>
      </section>

      {/* Image Upload Placeholder */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Imágenes</h3>
        <p className={styles.placeholder}>
          La carga de imágenes se implementará en una tarea posterior.
          Por ahora, las imágenes se pueden agregar después de crear el vehículo.
        </p>
      </section>

      {/* Technical Sheet Upload Placeholder */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ficha Técnica</h3>
        <p className={styles.placeholder}>
          La carga de ficha técnica se implementará en una tarea posterior.
        </p>
      </section>

      {/* Debug info */}
      {Object.keys(errors).length > 0 && (
        <div style={{color: 'red', padding: '10px', background: '#fee'}}>
          <strong>Errores de validación:</strong>
          {Object.entries(errors).map(([key, error]) => (
            <div key={key}>{key}: {error?.message}</div>
          ))}
        </div>
      )}

      {/* Form Actions */}
      <div className={styles.actions}>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: '#0F6BBE',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isLoading ? 'Guardando...' : (initialData ? 'Actualizar Vehículo' : 'Crear Vehículo')}
        </button>
      </div>
    </form>
  );
}
