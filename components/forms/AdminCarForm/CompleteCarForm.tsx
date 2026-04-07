'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray, type FieldErrors, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { carCreateSchema, carUpdateSchema, type CarCreateInput, type FuelType, type Transmission, type CarStatus, type Currency } from '@/lib/schemas/car'
import Input from '@/components/ui/Input/Input'
import Select from '@/components/ui/Select/Select'
import Button from '@/components/ui/Button/Button'
import ImageUploader, { type ImageData, type StagedImage } from '@/components/admin/ImageUploader/ImageUploader'
import TechnicalSheetUploader from '@/components/admin/TechnicalSheetUploader/TechnicalSheetUploader'
import { FUEL_TYPE_OPTIONS, TRANSMISSION_OPTIONS, STATUS_OPTIONS, YEAR_OPTIONS, CURRENCY_OPTIONS } from '@/lib/constants/car-options'
import styles from './CompleteCarForm.module.css'

/**
 * Schema for form validation that accepts features as array of objects
 * (because react-hook-form's useFieldArray wraps values in objects)
 */
const carCreateFormSchema = carCreateSchema.omit({ features: true }).extend({
  features: z.array(z.object({ value: z.string() })).default([]),
})

const carUpdateFormSchema = carCreateFormSchema.omit({ price: true }).extend({
  price: z.number().int().nonnegative('El precio no puede ser negativo').optional(),
})

interface CompleteCarFormData {
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: FuelType
  transmission: Transmission
  status: CarStatus
  featured: boolean
  description?: string
  features: { value: string }[]
  currency: Currency
  engine?: string
  doors?: number
}

interface CompleteCarFormProps {
  carId?: string
  initialData?: Partial<CarCreateInput>
  onSubmit: (data: FormData) => Promise<void>
  existingImages?: Array<{ id: string; url: string; publicId: string; order: number; width?: number; height?: number }>
  existingTechnicalSheet?: { publicId: string; url: string; filename: string }
  isLoading?: boolean
}

export default function CompleteCarForm({
  carId,
  initialData,
  onSubmit,
  existingImages = [],
  existingTechnicalSheet,
  isLoading = false,
}: CompleteCarFormProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [currentImages, setCurrentImages] = useState<ImageData[]>(existingImages)
  const [stagedFiles, setStagedFiles] = useState<StagedImage[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CompleteCarFormData>({
    resolver: zodResolver(initialData ? carUpdateFormSchema : carCreateFormSchema),
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
      features: (initialData?.features || []).map((f) => ({ value: f })),
      currency: initialData?.currency || 'ARS',
      engine: initialData?.engine || '',
      doors: initialData?.doors,
    },
  })

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: 'features',
  })

  const selectedCurrency = watch('currency')

  const handleFormSubmit = async (data: CompleteCarFormData) => {
    setSubmitError(null)

    try {
      // Build form data
      const formData = new FormData()
      formData.append('brand', data.brand)
      formData.append('model', data.model)
      formData.append('year', String(data.year))
      formData.append('price', String(data.price))
      formData.append('mileage', String(data.mileage))
      formData.append('fuelType', data.fuelType)
      formData.append('transmission', data.transmission)
      formData.append('status', data.status)
      formData.append('featured', String(data.featured))
      formData.append('currency', data.currency)
      if (data.description) formData.append('description', data.description)
      formData.append('features', JSON.stringify(data.features.map((f) => f.value).filter(Boolean)))

      // Optional fields
      if (data.engine) formData.append('engine', data.engine)
      // Handle doors - only send if it has a valid value
      if (data.doors !== undefined && data.doors !== null && !Number.isNaN(data.doors)) {
        formData.append('doors', String(data.doors))
      }

      // Compute deleted image IDs (images that existed before but are no longer in current list)
      const deletedImageIds = existingImages.filter((existing) => !currentImages.some((current) => current.id === existing.id)).map((img) => img.id)
      if (deletedImageIds.length > 0) {
        formData.append('deletedImageIds', JSON.stringify(deletedImageIds))
      }

      // Send staged images (already uploaded to Cloudinary, just need DB save)
      if (stagedFiles.length > 0) {
        formData.append('stagedImages', JSON.stringify(stagedFiles))
      }

      // Detect reordered images (existing images whose order changed)
      const reorderedImages = currentImages
        .filter((current) => {
          const original = existingImages.find((e) => e.id === current.id)
          return original && original.order !== current.order
        })
        .map((current) => ({ id: current.id, order: current.order }))

      if (reorderedImages.length > 0) {
        formData.append('reorderedImages', JSON.stringify(reorderedImages))
      }

      await onSubmit(formData)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar el vehículo')
    }
  }

  // Scroll to first error on validation failure
  const onInvalid = (errors: FieldErrors<CompleteCarFormData>) => {
    // Extract error messages from react-hook-form errors
    const errorMessages = Object.values(errors)
      .map((err) => {
        const error = err as { message?: string; type?: string | number } | undefined
        if (error?.message) return error.message
        if (error?.type) return `Campo inválido: ${error.type}`
        return null
      })
      .filter(Boolean)

    if (errorMessages.length > 0) {
      setSubmitError(errorMessages[0])
    } else {
      setSubmitError('Por favor complete todos los campos requeridos')
    }

    // Scroll to first error
    const firstErrorKey = Object.keys(errors)[0]
    if (firstErrorKey) {
      const element = document.querySelector(`[name="${firstErrorKey}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        ;(element as HTMLElement).focus()
      }
    }
  }

  // Transform existing images to ImageData format
  const imageData: ImageData[] = existingImages.map((img, idx) => ({
    id: img.id,
    publicId: img.publicId,
    url: img.url,
    secureUrl: img.url,
    width: img.width || 0,
    height: img.height || 0,
    order: img.order ?? idx,
  }))

  // Handle doors input change - convert empty string to undefined
  const handleDoorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || value === null || value === undefined) {
      setValue('doors', undefined, { shouldValidate: false })
    } else {
      const numValue = parseInt(value, 10)
      if (!Number.isNaN(numValue)) {
        setValue('doors', numValue, { shouldValidate: true })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, onInvalid)} className={styles.form}>
      {submitError && <div className={styles.submitError}>{submitError}</div>}

      {/* Section 1: Basic Information */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Información Básica</h3>

        <div className={styles.grid}>
          <Input label="Marca" {...register('brand')} error={errors.brand?.message} placeholder="Ej: Toyota" required />

          <Input label="Modelo" {...register('model')} error={errors.model?.message} placeholder="Ej: Corolla" required />

          <Select label="Año" options={YEAR_OPTIONS} {...register('year', { valueAsNumber: true })} error={errors.year?.message} required />

          <div className={styles.priceField}>
            <div className={styles.priceInputWrapper}>
              <div className={styles.priceInput}>
                <Input
                  label="Precio"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  error={errors.price?.message}
                  placeholder="Ej: 25000000"
                  required
                />
              </div>
              <div className={styles.currencySelect}>
                <Select label="Moneda" options={CURRENCY_OPTIONS} {...register('currency')} error={errors.currency?.message} required />
              </div>
            </div>
          </div>

          <Input
            label="Kilometraje (km)"
            type="number"
            {...register('mileage', { valueAsNumber: true })}
            error={errors.mileage?.message}
            placeholder="Ej: 50000"
            required
          />

          <Select label="Combustible" options={FUEL_TYPE_OPTIONS} {...register('fuelType')} error={errors.fuelType?.message} required />

          <Select label="Transmisión" options={TRANSMISSION_OPTIONS} {...register('transmission')} error={errors.transmission?.message} required />

          <Select label="Estado" options={STATUS_OPTIONS} {...register('status')} error={errors.status?.message} required />

          {/* Motor - moved from technical specs */}
          <Input label="Motor" {...register('engine')} error={errors.engine?.message} placeholder="Ej: 1.6 16v" />

          {/* Puertas - moved from technical specs */}
          <Input
            label="Puertas"
            type="number"
            min={2}
            max={6}
            {...register('doors', {
              setValueAs: (v) => {
                // Convert empty string, null, or NaN to undefined
                if (v === '' || v === null || v === undefined || Number.isNaN(v)) {
                  return undefined
                }
                const parsed = parseInt(v, 10)
                return Number.isNaN(parsed) ? undefined : parsed
              },
            })}
            onChange={handleDoorsChange}
            error={errors.doors?.message}
            placeholder="Ej: 4"
          />
        </div>

        <div className={styles.checkbox}>
          <input type="checkbox" id="featured" {...register('featured')} />
          <label htmlFor="featured">Vehículo Destacado</label>
        </div>
      </section>

      {/* Section 2: Description & Features */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Descripción y Características</h3>

        <div className={styles.textareaWrapper}>
          <label htmlFor="description" className={styles.label}>
            Descripción
          </label>
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
          <span className={styles.charCount}>{(watch('description') || '').length} / 5000 caracteres</span>
        </div>

        <div className={styles.featuresList}>
          <label className={styles.label}>Características</label>
          {featureFields.map((field, index) => (
            <div key={field.id} className={styles.featureItem}>
              <Input {...register(`features.${index}.value`)} placeholder="Ej: Aire acondicionado" />
              <Button type="button" variant="danger" size="sm" onClick={() => removeFeature(index)}>
                ✕
              </Button>
            </div>
          ))}

          <Button type="button" variant="secondary" size="sm" onClick={() => appendFeature({ value: '' })}>
            + Agregar Característica
          </Button>
        </div>
      </section>

      {/* Section 3: Images */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Imágenes</h3>
        {carId ? (
          <ImageUploader carId={carId} initialImages={imageData} maxImages={20} onImagesChange={setCurrentImages} onStagedChange={setStagedFiles} />
        ) : (
          <p className={styles.infoText}>Las imágenes se podrán agregar después de crear el vehículo.</p>
        )}
      </section>

      {/* Section 4: Technical Sheet */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ficha Técnica</h3>
        {carId ? (
          <TechnicalSheetUploader carId={carId} initialSheet={existingTechnicalSheet} />
        ) : (
          <p className={styles.infoText}>La ficha técnica se podrá agregar después de crear el vehículo.</p>
        )}
      </section>

      {/* Form Actions */}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => router.push('/admin/autos')} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Actualizar Vehículo' : 'Crear Vehículo'}
        </Button>
      </div>
    </form>
  )
}
