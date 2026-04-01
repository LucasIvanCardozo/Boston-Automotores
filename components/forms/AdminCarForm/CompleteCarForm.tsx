'use client';

import { z } from 'zod';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { 
  carCreateSchema, 
  carUpdateSchema, 
  type CarCreateInput,
  type FuelType,
  type Transmission,
  type CarStatus,
  type Steering,
  type Headlights,
  SENSOR_OPTIONS,
  SECURITY_FEATURE_OPTIONS,
  COMFORT_FEATURE_OPTIONS,
  carSpecsSchema,
  type CarSpecs,
} from '@/lib/schemas/car';
import Input from '@/components/ui/Input/Input';
import Select from '@/components/ui/Select/Select';
import Button from '@/components/ui/Button/Button';
import ImageUploader, { type ImageData, type StagedImage } from '@/components/admin/ImageUploader/ImageUploader';
import TechnicalSheetUploader from '@/components/admin/TechnicalSheetUploader/TechnicalSheetUploader';
import {
  FUEL_TYPE_OPTIONS,
  TRANSMISSION_OPTIONS,
  STATUS_OPTIONS,
  STEERING_OPTIONS,
  HEADLIGHTS_OPTIONS,
  YEAR_OPTIONS,
} from '@/lib/constants/car-options';
import styles from './CompleteCarForm.module.css';

/**
 * Schema for form validation that accepts features as array of objects
 * (because react-hook-form's useFieldArray wraps values in objects)
 */
const carSpecsFormSchema = carSpecsSchema.extend({
  sensors: z.array(z.string()).default([]),
  securityFeatures: z.array(z.string()).default([]),
  comfortFeatures: z.array(z.string()).default([]),
});

const carCreateFormSchema = carCreateSchema.omit({ features: true, specs: true }).extend({
  features: z.array(z.object({ value: z.string() })).default([]),
  specs: carSpecsFormSchema.optional(),
});

const carUpdateFormSchema = carCreateFormSchema.omit({ price: true }).extend({
  price: z.number().int().nonnegative('El precio no puede ser negativo').optional(),
});

interface CompleteCarFormData {
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
  specs: {
    engine?: string;
    steering?: Steering;
    color?: string;
    doors?: number;
    wheels?: string;
    wheelSize?: string;
    audioSystem?: string;
    headlights?: Headlights;
    sensors: string[];
    securityFeatures: string[];
    comfortFeatures: string[];
  };
}

interface CompleteCarFormProps {
  carId?: string;
  initialData?: Partial<CarCreateInput & { specs?: CarSpecs | null }>;
  onSubmit: (data: FormData) => Promise<void>;
  existingImages?: Array<{ id: string; url: string; publicId: string; order: number; width?: number; height?: number }>;
  existingTechnicalSheet?: { publicId: string; url: string; filename: string };
  isLoading?: boolean;
}

const sensorOptions = SENSOR_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ') }));
const securityFeatureOptions = SECURITY_FEATURE_OPTIONS.map(s => ({
  value: s,
  label: s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
}));
const comfortFeatureOptions = COMFORT_FEATURE_OPTIONS.map(s => ({
  value: s,
  label: s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
}));

// Checkbox component for arrays
function ArrayCheckbox({
  label,
  value,
  checked,
  onChange,
}: {
  label: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export default function CompleteCarForm({
  carId,
  initialData,
  onSubmit,
  existingImages = [],
  existingTechnicalSheet,
  isLoading = false,
}: CompleteCarFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentImages, setCurrentImages] = useState<ImageData[]>(existingImages);
  const [stagedFiles, setStagedFiles] = useState<StagedImage[]>([]);
  
  // Default specs values
  const defaultSpecs = {
    engine: '',
    steering: undefined as Steering | undefined,
    color: '',
    doors: undefined as number | undefined,
    wheels: '',
    wheelSize: '',
    audioSystem: '',
    headlights: undefined as Headlights | undefined,
    sensors: [] as string[],
    securityFeatures: [] as string[],
    comfortFeatures: [] as string[],
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompleteCarFormData>({
    resolver: zodResolver(initialData ? carUpdateFormSchema : carCreateFormSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      price: initialData?.price || 0,
      mileage: initialData?.mileage || 0,
      fuelType: initialData?.fuelType || 'nafta',
      transmission: initialData?.transmission || 'automatica',
      status: initialData?.status || 'available',
      featured: initialData?.featured || false,
      description: initialData?.description || '',
      features: (initialData?.features || []).map(f => ({ value: f })),
      specs: (initialData?.specs && initialData.specs !== null) ? {
        engine: initialData.specs.engine || '',
        steering: initialData.specs.steering,
        color: initialData.specs.color || '',
        doors: initialData.specs.doors,
        wheels: initialData.specs.wheels || '',
        wheelSize: initialData.specs.wheelSize || '',
        audioSystem: initialData.specs.audioSystem || '',
        headlights: initialData.specs.headlights,
        sensors: initialData.specs.sensors || [],
        securityFeatures: initialData.specs.securityFeatures || [],
        comfortFeatures: initialData.specs.comfortFeatures || [],
      } : defaultSpecs,
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'features',
  });

  const watchedSpecs = watch('specs');

  const handleArrayFieldChange = useCallback((
    field: 'sensors' | 'securityFeatures' | 'comfortFeatures',
    value: string,
    checked: boolean
  ) => {
    const current = watchedSpecs?.[field] || [];
    if (checked) {
      setValue(`specs.${field}`, [...current, value] as any);
    } else {
      setValue(`specs.${field}`, current.filter((v: string) => v !== value) as any);
    }
  }, [watchedSpecs, setValue]);

  const handleFormSubmit = async (data: CompleteCarFormData) => {
    setSubmitError(null);
    
    try {
      // Build specs object
      const specs: Partial<CarSpecs> = {};
      if (data.specs.engine) specs.engine = data.specs.engine;
      if (data.specs.steering) specs.steering = data.specs.steering;
      if (data.specs.color) specs.color = data.specs.color;
      if (data.specs.doors) specs.doors = data.specs.doors;
      if (data.specs.wheels) specs.wheels = data.specs.wheels;
      if (data.specs.wheelSize) specs.wheelSize = data.specs.wheelSize;
      if (data.specs.audioSystem) specs.audioSystem = data.specs.audioSystem;
      if (data.specs.headlights) specs.headlights = data.specs.headlights;
      if (data.specs.sensors.length > 0) specs.sensors = data.specs.sensors;
      if (data.specs.securityFeatures.length > 0) specs.securityFeatures = data.specs.securityFeatures;
      if (data.specs.comfortFeatures.length > 0) specs.comfortFeatures = data.specs.comfortFeatures;

      // Validate specs
      const specsValidation = carSpecsSchema.safeParse(specs);
      if (!specsValidation.success) {
        setSubmitError('Especificaciones técnicas inválidas');
        return;
      }

      // Build form data
      const formData = new FormData();
      formData.append('brand', data.brand);
      formData.append('model', data.model);
      formData.append('year', String(data.year));
      formData.append('price', String(data.price));
      formData.append('mileage', String(data.mileage));
      formData.append('fuelType', data.fuelType);
      formData.append('transmission', data.transmission);
      formData.append('status', data.status);
      formData.append('featured', String(data.featured));
      if (data.description) formData.append('description', data.description);
      formData.append('features', JSON.stringify(data.features.map(f => f.value).filter(Boolean)));
      formData.append('specs', JSON.stringify(specsValidation.data));

      // Compute deleted image IDs (images that existed before but are no longer in current list)
      const deletedImageIds = existingImages
        .filter(existing => !currentImages.some(current => current.id === existing.id))
        .map(img => img.id);
      if (deletedImageIds.length > 0) {
        formData.append('deletedImageIds', JSON.stringify(deletedImageIds));
      }

      // Send staged images (already uploaded to Cloudinary, just need DB save)
      if (stagedFiles.length > 0) {
        formData.append('stagedImages', JSON.stringify(stagedFiles));
      }

      // Detect reordered images (existing images whose order changed)
      const reorderedImages = currentImages
        .filter(current => {
          const original = existingImages.find(e => e.id === current.id);
          return original && original.order !== current.order;
        })
        .map(current => ({ id: current.id, order: current.order }));
      
      if (reorderedImages.length > 0) {
        formData.append('reorderedImages', JSON.stringify(reorderedImages));
      }

      await onSubmit(formData);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar el vehículo');
    }
  };

  // Scroll to first error on validation failure
  const onInvalid = (errors: any) => {
    // Extract error messages from react-hook-form errors
    const errorMessages = Object.values(errors).map((err: any) => {
      if (err?.message) return err.message;
      if (err?.type) return `Campo inválido: ${err.type}`;
      return null;
    }).filter(Boolean);
    
    if (errorMessages.length > 0) {
      setSubmitError(errorMessages[0]);
    } else {
      setSubmitError('Por favor complete todos los campos requeridos');
    }
    
    // Scroll to first error
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const element = document.querySelector(`[name="${firstErrorKey}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLElement).focus();
      }
    }
  };

  // Transform existing images to ImageData format
  const imageData: ImageData[] = existingImages.map((img, idx) => ({
    id: img.id,
    publicId: img.publicId,
    url: img.url,
    secureUrl: img.url,
    width: img.width || 0,
    height: img.height || 0,
    order: img.order ?? idx,
  }));

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit, onInvalid)} 
      className={styles.form}
    >
      {submitError && (
        <div className={styles.submitError}>
          {submitError}
        </div>
      )}

      {/* Section 1: Basic Information */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Información Básica</h3>
        
        <div className={styles.grid}>
          <Input
            label="Marca"
            {...register('brand')}
            error={errors.brand?.message}
            placeholder="Ej: Toyota"
            required
          />
          
          <Input
            label="Modelo"
            {...register('model')}
            error={errors.model?.message}
            placeholder="Ej: Corolla"
            required
          />
          
          <Select
            label="Año"
            options={YEAR_OPTIONS}
            {...register('year', { valueAsNumber: true })}
            error={errors.year?.message}
            required
          />
          
          <Input
            label="Precio (ARS)"
            type="number"
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
            placeholder="Ej: 25000000"
            required
          />
          
          <Input
            label="Kilometraje (km)"
            type="number"
            {...register('mileage', { valueAsNumber: true })}
            error={errors.mileage?.message}
            placeholder="Ej: 50000"
            required
          />

          <Select
            label="Tipo de Combustible"
            options={FUEL_TYPE_OPTIONS}
            {...register('fuelType')}
            error={errors.fuelType?.message}
            required
          />
          
          <Select
            label="Transmisión"
            options={TRANSMISSION_OPTIONS}
            {...register('transmission')}
            error={errors.transmission?.message}
            required
          />
          
          <Select
            label="Estado"
            options={STATUS_OPTIONS}
            {...register('status')}
            error={errors.status?.message}
            required
          />
        </div>

        <div className={styles.checkbox}>
          <input
            type="checkbox"
            id="featured"
            {...register('featured')}
          />
          <label htmlFor="featured">Vehículo Destacado</label>
        </div>
      </section>

      {/* Section 2: Description & Features */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Descripción y Características</h3>
        
        <div className={styles.textareaWrapper}>
          <label htmlFor="description" className={styles.label}>Descripción</label>
          <textarea
            id="description"
            className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
            placeholder="Describe las características principales del vehículo..."
            {...register('description')}
            rows={5}
            maxLength={5000}
          />
          {errors.description && (
            <span className={styles.error}>
              <AlertCircle size={16} />
              {errors.description.message}
            </span>
          )}
          <span className={styles.charCount}>
            {(watch('description') || '').length} / 5000 caracteres
          </span>
        </div>

        <div className={styles.featuresList}>
          <label className={styles.label}>Características</label>
          {featureFields.map((field, index) => (
            <div key={field.id} className={styles.featureItem}>
              <Input
                {...register(`features.${index}.value`)}
                placeholder="Ej: Aire acondicionado"
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeFeature(index)}
              >
                ✕
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendFeature({ value: '' })}
          >
            + Agregar Característica
          </Button>
        </div>
      </section>

      {/* Section 3: Technical Specifications */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Especificaciones Técnicas</h3>
        
        <div className={styles.grid}>
          <Input
            label="Motor"
            {...register('specs.engine')}
            error={errors.specs?.engine?.message}
            placeholder="Ej: 1.6 16v"
          />
          
          <Select
            label="Dirección"
            options={STEERING_OPTIONS}
            {...register('specs.steering')}
            error={errors.specs?.steering?.message}
          />
          
          <Input
            label="Color"
            {...register('specs.color')}
            error={errors.specs?.color?.message}
            placeholder="Ej: Blanco"
          />
          
          <Input
            label="Puertas"
            type="number"
            min={1}
            max={10}
            {...register('specs.doors', { valueAsNumber: true })}
            error={errors.specs?.doors?.message}
            placeholder="Ej: 4"
          />
          
          <Input
            label="Llantas"
            {...register('specs.wheels')}
            error={errors.specs?.wheels?.message}
            placeholder="Ej: Aleación"
          />
          
          <Input
            label="Tamaño de Llantas"
            {...register('specs.wheelSize')}
            error={errors.specs?.wheelSize?.message}
            placeholder="Ej: 17 pulgadas"
          />
          
          <Input
            label="Sistema de Audio"
            {...register('specs.audioSystem')}
            error={errors.specs?.audioSystem?.message}
            placeholder="Ej: Android Auto, 6 parlantes"
          />
          
          <Select
            label="Faros"
            options={HEADLIGHTS_OPTIONS}
            {...register('specs.headlights')}
            error={errors.specs?.headlights?.message}
          />
        </div>

        {/* Sensors Multi-select */}
        <div className={styles.multiSelect}>
          <label className={styles.label}>Sensores</label>
          <div className={styles.checkboxGroup}>
            {sensorOptions.map((option) => (
              <ArrayCheckbox
                key={option.value}
                label={option.label}
                value={option.value}
                checked={watchedSpecs?.sensors?.includes(option.value) || false}
                onChange={(checked) => handleArrayFieldChange('sensors', option.value, checked)}
              />
            ))}
          </div>
        </div>

        {/* Security Features Multi-select */}
        <div className={styles.multiSelect}>
          <label className={styles.label}>Equipamiento de Seguridad</label>
          <div className={styles.checkboxGroup}>
            {securityFeatureOptions.map((option) => (
              <ArrayCheckbox
                key={option.value}
                label={option.label}
                value={option.value}
                checked={watchedSpecs?.securityFeatures?.includes(option.value) || false}
                onChange={(checked) => handleArrayFieldChange('securityFeatures', option.value, checked)}
              />
            ))}
          </div>
        </div>

        {/* Comfort Features Multi-select */}
        <div className={styles.multiSelect}>
          <label className={styles.label}>Confort</label>
          <div className={styles.checkboxGroup}>
            {comfortFeatureOptions.map((option) => (
              <ArrayCheckbox
                key={option.value}
                label={option.label}
                value={option.value}
                checked={watchedSpecs?.comfortFeatures?.includes(option.value) || false}
                onChange={(checked) => handleArrayFieldChange('comfortFeatures', option.value, checked)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Images */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Imágenes</h3>
        {carId ? (
          <ImageUploader
            carId={carId}
            initialImages={imageData}
            maxImages={20}
            onImagesChange={setCurrentImages}
            onStagedChange={setStagedFiles}
          />
        ) : (
          <p className={styles.infoText}>
            Las imágenes se podrán agregar después de crear el vehículo.
          </p>
        )}
      </section>

      {/* Section 5: Technical Sheet */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ficha Técnica</h3>
        {carId ? (
          <TechnicalSheetUploader
            carId={carId}
            initialSheet={existingTechnicalSheet}
          />
        ) : (
          <p className={styles.infoText}>
            La ficha técnica se podrá agregar después de crear el vehículo.
          </p>
        )}
      </section>

      {/* Form Actions */}
      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/autos')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {initialData ? 'Actualizar Vehículo' : 'Crear Vehículo'}
        </Button>
      </div>
    </form>
  );
}
