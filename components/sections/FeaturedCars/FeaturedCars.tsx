'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CarCard from '@/components/ui/CarCard/CarCard';
import styles from './FeaturedCars.module.css';

interface FeaturedCar {
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

interface FeaturedCarsProps {
  cars: FeaturedCar[];
}

export default function FeaturedCars({ cars }: FeaturedCarsProps) {
  if (!cars || cars.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className={styles.header}
        >
          <h2 className={styles.title}>Autos Destacados</h2>
          <p className={styles.subtitle}>
            Conocé nuestra selección de vehículos disponibles
          </p>
        </motion.div>

        <div className={styles.grid}>
          {cars.slice(0, 6).map((car, index) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <CarCard car={car} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={styles.cta}
        >
          <Link href="/catalogo" className={styles.viewAllButton}>
            Ver todos los autos
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
