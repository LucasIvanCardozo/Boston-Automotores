'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { sellCarFormSchema, type SellCarFormData } from '@/lib/schemas/contact';
import Button from '@/components/ui/Button/Button';
import styles from './SellCarForm.module.css';

interface SellCarFormProps {
  sourcePage?: string;
}

export default function SellCarForm({ sourcePage = '/vende-tu-auto' }: SellCarFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SellCarFormData>({
    resolver: zodResolver(sellCarFormSchema),
    mode: 'onBlur',
    defaultValues: {
      sourcePage,
    },
  });

  const onSubmit = async (data: SellCarFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'sell_car',
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Error al enviar la consulta');
      }

      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar la consulta');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className={styles.successMessage}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h3 className={styles.successTitle}>¡Consulta enviada!</h3>
        <p className={styles.successText}>
          Gracias por contactarnos. Nos pondremos en contacto con vos a la brevedad.
        </p>
        <Button variant="secondary" onClick={() => setSubmitStatus('idle')}>
          Enviar otra consulta
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {/* Honeypot field for spam protection */}
      <input
        type="text"
        {...register('honeypot')}
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>Nombre completo *</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Tu nombre"
          />
          {errors.name && (
            <span className={styles.error}>
              <AlertCircle size={16} />
              {errors.name.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>Teléfono *</label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            placeholder="Ej: 2234567890"
          />
          {errors.phone && (
            <span className={styles.error}>
              <AlertCircle size={16} />
              {errors.phone.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>Email *</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="tu@email.com"
        />
        {errors.email && (
          <span className={styles.error}>
            <AlertCircle size={16} />
            {errors.email.message}
          </span>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="carBrand" className={styles.label}>Marca del auto *</label>
          <input
            id="carBrand"
            type="text"
            {...register('carBrand')}
            className={`${styles.input} ${errors.carBrand ? styles.inputError : ''}`}
            placeholder="Ej: Ford"
          />
          {errors.carBrand && (
            <span className={styles.error}>
              <AlertCircle size={16} />
              {errors.carBrand.message}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="carModel" className={styles.label}>Modelo *</label>
          <input
            id="carModel"
            type="text"
            {...register('carModel')}
            className={`${styles.input} ${errors.carModel ? styles.inputError : ''}`}
            placeholder="Ej: Focus"
          />
          {errors.carModel && (
            <span className={styles.error}>
              <AlertCircle size={16} />
              {errors.carModel.message}
            </span>
          )}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="carYear" className={styles.label}>Año</label>
          <select
            id="carYear"
            {...register('carYear', { valueAsNumber: true })}
            className={styles.input}
          >
            <option value="">Seleccionar año</option>
            {Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => {
              const year = new Date().getFullYear() + 1 - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="carMileage" className={styles.label}>Kilometraje</label>
          <input
            id="carMileage"
            type="number"
            {...register('carMileage', { valueAsNumber: true })}
            className={styles.input}
            placeholder="Ej: 50000"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Comentarios adicionales</label>
        <textarea
          id="message"
          {...register('message')}
          className={styles.textarea}
          rows={4}
          placeholder="Contanos más sobre tu auto, estado, etc."
        />
      </div>

      {submitStatus === 'error' && (
        <div className={styles.errorAlert}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
      </Button>
    </form>
  );
}
