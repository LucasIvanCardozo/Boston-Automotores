import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getCatalogCars, getAvailableBrands } from '@/lib/data/cars'
import CarFilterForm from '@/components/forms/CarFilterForm/CarFilterForm'
import CarGrid from '@/components/sections/CarGrid/CarGrid'
import Loading from '@/components/ui/Loading/Loading'
import styles from './page.module.css'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bostonautomotores.com.ar'

export const metadata: Metadata = {
  title: 'Autos Usados en Mar del Plata | Catálogo | Boston Automotores',
  description: 'Autos usados en Mar del Plata | Catálogo con garantía y financiación en 12 cuotas. Encontrá tu próximo vehículo en Boston Automotores.',
  alternates: {
    canonical: `${baseUrl}/catalogo`,
  },
}

interface SearchParams {
  brand?: string
  maxPrice?: string
  maxMileage?: string
  page?: string
}

function buildPageUrl(params: SearchParams, page: number): string {
  const query = new URLSearchParams()
  query.set('page', String(page))
  if (params.brand) query.set('brand', params.brand)
  if (params.maxPrice) query.set('maxPrice', params.maxPrice)
  if (params.maxMileage) query.set('maxMileage', params.maxMileage)
  return query.toString()
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [{ cars, total, totalPages, currentPage }, availableBrands] = await Promise.all([getCatalogCars(params), getAvailableBrands()])

  return (
    <div className={styles.page}>
      {/* Epic Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerBadge}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            Boston Automotores
          </div>

          <h1 className={styles.title}>
            Catálogo de Autos
            <span className={styles.titleAccent}>Usados Seleccionados</span>
          </h1>

          <p className={styles.subtitle}>Encontrá tu próximo vehículo con las mejores condiciones</p>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{total}</span>
              <span className={styles.statLabel}>Vehículos</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>12</span>
              <span className={styles.statLabel}>Cuotas</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>24</span>
              <span className={styles.statLabel}>Cuotas</span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {/* Simplified Filters */}
        <div className={styles.filters}>
          <div className={styles.filtersInner}>
            <CarFilterForm availableBrands={availableBrands} />
          </div>
        </div>

        <Suspense fallback={<Loading />}>
          <CarGrid cars={cars} />
        </Suspense>

        {totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Paginación">
            <div className={styles.paginationInfo}>
              Página {currentPage} de {totalPages}
            </div>
            <div className={styles.paginationLinks}>
              {currentPage > 1 && (
                <Link href={`?${buildPageUrl(params, currentPage - 1)}`} className={styles.paginationLink}>
                  Anterior
                </Link>
              )}
              {currentPage < totalPages && (
                <Link href={`?${buildPageUrl(params, currentPage + 1)}`} className={styles.paginationLink}>
                  Siguiente
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
