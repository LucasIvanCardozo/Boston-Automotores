import { Suspense } from 'react'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CarFilterForm from '@/components/forms/CarFilterForm/CarFilterForm'
import CarGrid from '@/components/sections/CarGrid/CarGrid'
import Loading from '@/components/ui/Loading/Loading'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Catálogo de Autos',
  description: 'Explorá nuestro catálogo de autos usados en Mar del Plata. Encontrá tu próximo vehículo con las mejores condiciones de financiación.',
}

// Force dynamic rendering to ensure filters work
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SearchParams {
  brand?: string
  maxPrice?: string
  maxMileage?: string
  page?: string
}

async function getCars(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1', 10)
  const limit = 12

  const where: Record<string, unknown> = {
    deletedAt: null,
    status: { in: ['available', 'reserved'] },
  }

  if (searchParams.brand) {
    where.brand = { contains: searchParams.brand, mode: 'insensitive' }
  }

  if (searchParams.maxPrice) {
    where.price = { ...((where.price as object) || {}), lte: parseInt(searchParams.maxPrice, 10) }
  }

  if (searchParams.maxMileage) {
    where.mileage = { ...((where.mileage as object) || {}), lte: parseInt(searchParams.maxMileage, 10) }
  }

  try {
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.car.count({ where }),
    ])

    return {
      cars: cars.map((car) => ({
        ...car,
        price: Number(car.price),
      })),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching cars:', error)
    return {
      cars: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    }
  }
}

async function getAvailableBrands(): Promise<string[]> {
  try {
    const cars = await prisma.car.findMany({
      where: {
        deletedAt: null,
        status: { in: ['available', 'reserved'] },
      },
      select: {
        brand: true,
      },
      distinct: ['brand'],
      orderBy: {
        brand: 'asc',
      },
    })

    return cars.map((car) => car.brand)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [{ cars, total, totalPages, currentPage }, availableBrands] = await Promise.all([getCars(params), getAvailableBrands()])

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
              <span className={styles.statValue}>0km</span>
              <span className={styles.statLabel}>Recién llegados</span>
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
                <a
                  href={`?page=${currentPage - 1}${params.brand ? `&brand=${params.brand}` : ''}${params.maxPrice ? `&maxPrice=${params.maxPrice}` : ''}${params.maxMileage ? `&maxMileage=${params.maxMileage}` : ''}`}
                  className={styles.paginationLink}
                >
                  Anterior
                </a>
              )}
              {currentPage < totalPages && (
                <a
                  href={`?page=${currentPage + 1}${params.brand ? `&brand=${params.brand}` : ''}${params.maxPrice ? `&maxPrice=${params.maxPrice}` : ''}${params.maxMileage ? `&maxMileage=${params.maxMileage}` : ''}`}
                  className={styles.paginationLink}
                >
                  Siguiente
                </a>
              )}
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}
