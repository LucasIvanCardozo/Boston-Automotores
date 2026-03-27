import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ImageGallery from '@/components/ui/ImageGallery/ImageGallery';
import Specifications from '@/components/sections/CarDetail/Specifications';
import ContactCTA from '@/components/sections/CarDetail/ContactCTA';
import RelatedCars from '@/components/sections/CarDetail/RelatedCars';
import styles from './page.module.css';

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getCar(id: string) {
  try {
    const car = await prisma.car.findUnique({
      where: { id, deletedAt: null },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        technicalSheet: true,
      },
    });

    if (!car) return null;

    return {
      ...car,
      price: Number(car.price),
    };
  } catch (error) {
    console.error('Error fetching car:', error);
    return null;
  }
}

async function getRelatedCars(currentCarId: string, brand: string) {
  try {
    const cars = await prisma.car.findMany({
      where: {
        deletedAt: null,
        status: { in: ['available', 'reserved'] },
        id: { not: currentCarId },
        OR: [
          { brand },
          { price: { gte: 0 } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    return cars.map((car) => ({
      ...car,
      price: Number(car.price),
    }));
  } catch (error) {
    console.error('Error fetching related cars:', error);
    return [];
  }
}

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getCar(id);

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
  const car = await getCar(id);

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
            <a href="/">Inicio</a>
            <span>/</span>
            <a href="/catalogo">Catálogo</a>
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
