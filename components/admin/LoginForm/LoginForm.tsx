'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/schemas/admin'
import { loginAction } from '@/app/actions/admin'
import styles from './LoginForm.module.css'
import { useState } from 'react'

interface LoginFormProps {
  error?: string
}

export default function LoginForm({ error }: LoginFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('username', data.username)
      formData.append('password', data.password)

      const result = await loginAction(formData)

      if (!result.success && result.error) {
        window.location.href = '/admin/login?error=' + encodeURIComponent(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && (
        <div className={styles.errorAlert}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>
          Nombre de Usuario
        </label>
        <input
          {...register('username')}
          type="text"
          id="username"
          name="username"
          autoComplete="username"
          className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
          placeholder="Ingrese su nombre de usuario"
          disabled={loading}
        />
        {errors.username && <span className={styles.fieldError}>{errors.username.message}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Contraseña
        </label>
        <input
          {...register('password')}
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          placeholder="Ingrese su contraseña"
          disabled={loading}
        />
        {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? (
          <>
            <span className={styles.spinner} />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <span>Iniciar Sesión</span>
        )}
      </button>
    </form>
  )
}
