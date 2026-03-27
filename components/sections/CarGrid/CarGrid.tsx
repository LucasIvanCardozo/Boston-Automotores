'use client';

import { motion } from 'framer-motion';
import CarCard from '@/components/ui/CarCard/CarCard';
import styles from './CarGrid.module.css';

interface Car {
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

interface CarGridProps {
  cars: Car[];
  isLoading?: boolean;
}

function CarGridSkeleton() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.skeleton}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonPrice} />
            <div className={styles.skeletonSpecs} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CarGrid({ cars, isLoading = false }: CarGridProps) {
  if (isLoading) {
    return <CarGridSkeleton />;
  }

  if (!cars || cars.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🚗</div>
        <h3 className={styles.emptyTitle}>No se encontraron vehículos</h3>
        <p className={styles.emptyText}>
          Probá modificando los filtros o contactanos para ayudarte a encontrar tu próximo auto.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {cars.map((car, index) => (
        <motion.div
          key={car.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <CarCard car={car} />
        </motion.div>
      ))}
    </div>
  );
}
