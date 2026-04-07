import Link from 'next/link'
import Image from 'next/image'
import { Car, Fuel, Calendar, Gauge, Settings } from 'lucide-react'
import Badge from '@/components/ui/Badge/Badge'
import { formatPrice, formatMileage } from '@/lib/utils'
import styles from './CarCard.module.css'

interface CarCardProps {
  car: {
    id: string
    brand: string
    model: string
    year: number
    price: number
    mileage: number
    fuelType: string
    transmission: string
    status: string
    featured: boolean
    currency?: 'ARS' | 'USD'
    images: Array<{
      id: string
      url: string
      secureUrl: string
    }>
  }
}

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  available: { variant: 'success', label: 'Disponible' },
  reserved: { variant: 'warning', label: 'Reservado' },
  sold: { variant: 'error', label: 'Vendido' },
}

const fuelTypeLabels: Record<string, string> = {
  nafta: 'Nafta',
  diesel: 'Diesel',
  electrico: 'Eléctrico',
  hibrido: 'Híbrido',
  gnc: 'GNC',
}

const transmissionLabels: Record<string, string> = {
  manual: 'Manual',
  automatica: 'Automática',
  cvt: 'CVT',
}

export default function CarCard({ car }: CarCardProps) {
  const primaryImage = car.images?.[0]?.secureUrl || car.images?.[0]?.url || '/assets/default.webp'
  const statusInfo = statusConfig[car.status] || statusConfig.available
  const currency = car.currency || 'ARS'

  return (
    <Link href={`/catalogo/${car.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src={primaryImage}
          alt={`${car.brand} ${car.model} ${car.year}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
        />
        <Badge variant={statusInfo.variant} size="sm" className={styles.statusBadge}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {car.brand} {car.model}
          </h3>
          <p className={styles.year}>{car.year}</p>
        </div>

        <div className={styles.price}>{formatPrice(car.price, currency)}</div>

        <div className={styles.specs}>
          <div className={styles.spec}>
            <Calendar size={14} />
            <span>{car.year}</span>
          </div>
          <div className={styles.spec}>
            <Gauge size={14} />
            <span>{formatMileage(car.mileage)}</span>
          </div>
          <div className={styles.spec}>
            <Fuel size={14} />
            <span>{fuelTypeLabels[car.fuelType] || car.fuelType}</span>
          </div>
          <div className={styles.spec}>
            <Settings size={14} />
            <span>{transmissionLabels[car.transmission] || car.transmission}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
