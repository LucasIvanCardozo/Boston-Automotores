import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Fuel, Calendar, Gauge, Settings } from 'lucide-react';
import { getPublicCar, getRelatedCars, getAllAvailableCarIds } from '@/lib/data/cars';
import { formatPrice, formatMileage } from '@/lib/utils';
import ImageGallery from '@/components/ui/ImageGallery/ImageGallery';
import ContactCTA from '@/components/sections/CarDetail/ContactCTA';
import RelatedCars from '@/components/sections/CarDetail/RelatedCars';
import styles from './page.module.css';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bostonautomotores.com.ar';

/**
 * Generate static params for all available car pages at build time.
 * Only includes 'available' status cars since inventory changes frequently.
 * Uses React.cache() to deduplicate with getPublicCar calls in the page.
 */
export async function generateStaticParams() {
  const carIds = await getAllAvailableCarIds();
  
  return carIds.map((id) => ({ id }));
}

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getPublicCar(id);

  if (!car) {
    return {
      title: 'Vehículo no encontrado',
    };
  }

  const carName = `${car.brand} ${car.model} ${car.year}`;
  const currency = (car.currency as 'ARS' | 'USD') || 'ARS';
  const priceFormatted = formatPrice(car.price, currency);

  return {
    title: carName,
    description: `${carName} en venta por ${priceFormatted}. ${car.mileage.toLocaleString()} km, ${car.fuelType}, ${car.transmission}. Visítanos en Boston Automotores, Mar del Plata.`,
    openGraph: {
      title: `${carName} | Boston Automotores`,
      description: `${carName} - ${priceFormatted}`,
      images: car.images[0]?.secureUrl ? [car.images[0].secureUrl] : [],
    },
    alternates: {
      canonical: `${baseUrl}/catalogo/${id}`,
    },
  };
}

const fuelTypeLabels: Record<string, string> = {
  nafta: 'Nafta',
  diesel: 'Diesel',
  electrico: 'Eléctrico',
  hibrido: 'Híbrido',
  gnc: 'GNC',
};

const transmissionLabels: Record<string, string> = {
  manual: 'Manual',
  automatica: 'Automática',
  cvt: 'CVT',
};

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const car = await getPublicCar(id);

  if (!car) {
    notFound();
  }

  const relatedCars = await getRelatedCars(id, car.brand);

  const carName = `${car.brand} ${car.model} ${car.year}`;
  const currentUrl = `${baseUrl}/catalogo/${id}`;
  const currency = (car.currency as 'ARS' | 'USD') || 'ARS';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: carName,
    description: car.description || `${carName} - ${car.mileage.toLocaleString()} km`,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: currency,
      availability: car.status === 'available'
        ? 'https://schema.org/InStock'
        : car.status === 'reserved'
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/SoldOut',
    },
    image: car.images[0]?.secureUrl,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://bostonautomotores.com.ar/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Catálogo',
        item: 'https://bostonautomotores.com.ar/catalogo',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: carName,
        item: currentUrl,
      },
    ],
  };

  const jsonLd = [productJsonLd, breadcrumbJsonLd];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.breadcrumb}>
            <Link href="/">Inicio</Link>
            <span>/</span>
            <Link href="/catalogo">Catálogo</Link>
            <span>/</span>
            <span>{carName}</span>
          </div>

          <div className={styles.content}>
            <div className={styles.gallery}>
              <ImageGallery images={car.images} carName={carName} />
            </div>

            <div className={styles.details}>
              {/* Car Details Card */}
              <div className={styles.detailsCard}>
                <div className={styles.priceSection}>
                  <span className={styles.priceLabel}>Precio</span>
                  <span className={styles.price}>{formatPrice(car.price, currency)}</span>
                </div>

                {/* Basic info — 4 chips */}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Información General</h3>
                  <div className={styles.specGrid}>
                    <div className={styles.specItem}>
                      <div className={styles.specIcon}><Calendar size={20} /></div>
                      <div className={styles.specContent}>
                        <span className={styles.specLabel}>Año</span>
                        <span className={styles.specValue}>{car.year}</span>
                      </div>
                    </div>
                    <div className={styles.specItem}>
                      <div className={styles.specIcon}><Gauge size={20} /></div>
                      <div className={styles.specContent}>
                        <span className={styles.specLabel}>Kilometraje</span>
                        <span className={styles.specValue}>{formatMileage(car.mileage)}</span>
                      </div>
                    </div>
                    <div className={styles.specItem}>
                      <div className={styles.specIcon}><Fuel size={20} /></div>
                      <div className={styles.specContent}>
                        <span className={styles.specLabel}>Combustible</span>
                        <span className={styles.specValue}>{fuelTypeLabels[car.fuelType] || car.fuelType}</span>
                      </div>
                    </div>
                    <div className={styles.specItem}>
                      <div className={styles.specIcon}><Settings size={20} /></div>
                      <div className={styles.specContent}>
                        <span className={styles.specLabel}>Transmisión</span>
                        <span className={styles.specValue}>{transmissionLabels[car.transmission] || car.transmission}</span>
                      </div>
                    </div>
                    {car.engine && (
                      <div className={styles.specItem}>
                        <div className={styles.specIcon}><Settings size={20} /></div>
                        <div className={styles.specContent}>
                          <span className={styles.specLabel}>Motor</span>
                          <span className={styles.specValue}>{car.engine}</span>
                        </div>
                      </div>
                    )}
                    {car.doors && (
                      <div className={styles.specItem}>
                        <div className={styles.specIcon}><Settings size={20} /></div>
                        <div className={styles.specContent}>
                          <span className={styles.specLabel}>Puertas</span>
                          <span className={styles.specValue}>{car.doors}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Features list */}
                {car.features && car.features.length > 0 && (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Características</h3>
                    <ul className={styles.featureList}>
                      {car.features.map((feature, index) => (
                        <li key={index} className={styles.featureItem}>
                          <span className={styles.featureCheck}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {car.description && (
                  <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Descripción</h3>
                    <p className={styles.description}>{car.description}</p>
                  </section>
                )}
              </div>

              <ContactCTA carName={carName} />
            </div>
          </div>

          <RelatedCars cars={relatedCars} currentCarId={id} />
        </div>
      </div>
    </>
  );
}
