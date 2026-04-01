import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminCar } from '@/app/actions/cars';
import EditCarPageClient from './EditCarPageClient';
import type { CarCreateInput, CarSpecs } from '@/lib/schemas/car';

// Extended car type with relations
interface CarWithRelations {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: unknown;
  mileage: number;
  fuelType: 'nafta' | 'diesel' | 'electrico' | 'hibrido' | 'gnc';
  transmission: 'manual' | 'automatica' | 'cvt';
  status: 'available' | 'sold' | 'reserved';
  featured: boolean;
  description: string | null;
  features: string[];
  specs: CarSpecs | unknown | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: string;
    url: string;
    secureUrl: string;
    publicId?: string;
    width?: number;
    height?: number;
    order?: number;
  }>;
  technicalSheet?: {
    publicId: string;
    url: string;
    filename: string;
  } | null;
}

export const metadata: Metadata = {
  title: 'Editar Vehículo | Boston Automotores',
  description: 'Editar información del vehículo',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCarPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getAdminCar(id);

  if (!result.success || !result.data) {
    notFound();
  }

  // Cast to our extended type (first to unknown, then to target type)
  const car = result.data as unknown as CarWithRelations;

  // Transform the car data to match the form expected format
  const initialData: Partial<CarCreateInput & { specs?: CarSpecs | null }> = {
    brand: car.brand,
    model: car.model,
    year: car.year,
    price: typeof car.price === 'object' && car.price !== null 
      ? Number((car.price as { toString: () => string }).toString())
      : Number(car.price),
    mileage: car.mileage,
    fuelType: car.fuelType,
    transmission: car.transmission,
    status: car.status,
    featured: car.featured,
    description: car.description || '',
    features: car.features || [],
    specs: car.specs && car.specs !== null ? car.specs as CarSpecs : undefined,
  };

  // Transform images
  const existingImages = car.images.map((img, idx) => ({
    id: img.id,
    url: img.url,
    secureUrl: img.secureUrl,
    publicId: img.publicId || img.secureUrl,
    order: img.order ?? idx,
    width: img.width || 0,
    height: img.height || 0,
  }));

  // Transform technical sheet
  const existingTechnicalSheet = car.technicalSheet ? {
    publicId: car.technicalSheet.publicId,
    url: car.technicalSheet.url,
    filename: car.technicalSheet.filename,
  } : undefined;

  return (
    <EditCarPageClient
      carId={id}
      initialData={initialData}
      existingImages={existingImages}
      existingTechnicalSheet={existingTechnicalSheet}
      carName={`${car.brand} ${car.model} (${car.year})`}
    />
  );
}
