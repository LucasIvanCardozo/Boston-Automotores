'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { contactFormSchema, type ContactFormData } from '@/lib/schemas/contact';
import Button from '@/components/ui/Button/Button';
import styles from './ContactForm.module.css';

interface ContactFormProps {
  sourcePage?: string;
}

export default function ContactForm({ sourcePage = '/contacto' }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      sourcePage,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'contact',
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
          Gracias por contactarnos. Te responderemos a la brevedad.
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
          <span className={styles.error}>{errors.name.message}</span>
        )}
      </div>

      <div className={styles.row}>
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
            <span className={styles.error}>{errors.email.message}</span>
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
            <span className={styles.error}>{errors.phone.message}</span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>Mensaje *</label>
        <textarea
          id="message"
          {...register('message')}
          className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
          rows={5}
          placeholder="¿En qué podemos ayudarte?"
        />
        {errors.message && (
          <span className={styles.error}>{errors.message.message}</span>
        )}
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
        {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
      </Button>
    </form>
  );
}
