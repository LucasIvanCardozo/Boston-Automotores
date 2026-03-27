import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CarCard from '@/components/ui/CarCard/CarCard';
import styles from './RelatedCars.module.css';

interface RelatedCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  status: string;
  featured: boolean;
  images: Array<{
    id: string;
    url: string;
    secureUrl: string;
  }>;
}

interface RelatedCarsProps {
  cars: RelatedCar[];
  currentCarId: string;
}

export default function RelatedCars({ cars, currentCarId }: RelatedCarsProps) {
  const filteredCars = cars.filter((car) => car.id !== currentCarId).slice(0, 4);

  if (filteredCars.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Vehículos Relacionados</h3>
        <Link href="/catalogo" className={styles.viewAll}>
          Ver todos
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className={styles.grid}>
        {filteredCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
}
