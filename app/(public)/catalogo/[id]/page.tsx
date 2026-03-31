import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicCar, getRelatedCars } from '@/lib/data/cars';
import ImageGallery from '@/components/ui/ImageGallery/ImageGallery';
import Specifications from '@/components/sections/CarDetail/Specifications';
import ContactCTA from '@/components/sections/CarDetail/ContactCTA';
import RelatedCars from '@/components/sections/CarDetail/RelatedCars';
import styles from './page.module.css';

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
  const priceFormatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(car.price);

  return {
    title: carName,
    description: `${carName} en venta por ${priceFormatted}. ${car.mileage.toLocaleString()} km, ${car.fuelType}, ${car.transmission}. Visítanos en Boston Automotores, Mar del Plata.`,
    openGraph: {
      title: `${carName} | Boston Automotores`,
      description: `${carName} - ${priceFormatted}`,
      images: car.images[0]?.secureUrl ? [car.images[0].secureUrl] : [],
    },
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const car = await getPublicCar(id);

  if (!car) {
    notFound();
  }

  const relatedCars = await getRelatedCars(id, car.brand);

  const carName = `${car.brand} ${car.model} ${car.year}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: carName,
    description: car.description || `${carName} - ${car.mileage.toLocaleString()} km`,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'ARS',
      availability: car.status === 'available'
        ? 'https://schema.org/InStock'
        : car.status === 'reserved'
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/SoldOut',
    },
    image: car.images[0]?.secureUrl,
  };

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
              <Specifications car={car} />
              <ContactCTA carName={carName} />
            </div>
          </div>

          <RelatedCars cars={relatedCars} currentCarId={id} />
        </div>
      </div>
    </>
  );
}
