import { Car, Fuel, Calendar, Gauge, Settings, Droplets, CircleGauge, Armchair } from 'lucide-react';
import styles from './Specifications.module.css';

interface CarSpecificationsProps {
  car: {
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    description?: string | null;
    features: string[];
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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
};

const formatMileage = (mileage: number) => {
  return new Intl.NumberFormat('es-AR').format(mileage);
};

export default function Specifications({ car }: CarSpecificationsProps) {
  const basicSpecs = [
    {
      icon: <Calendar size={20} />,
      label: 'Año',
      value: car.year.toString(),
    },
    {
      icon: <Gauge size={20} />,
      label: 'Kilometraje',
      value: `${formatMileage(car.mileage)} km`,
    },
    {
      icon: <Fuel size={20} />,
      label: 'Combustible',
      value: fuelTypeLabels[car.fuelType] || car.fuelType,
    },
    {
      icon: <Settings size={20} />,
      label: 'Transmisión',
      value: transmissionLabels[car.transmission] || car.transmission,
    },
  ];

  const technicalSpecs = [
    {
      icon: <CircleGauge size={20} />,
      label: 'Motor',
      value: '2.0L Turbo',
    },
    {
      icon: <Droplets size={20} />,
      label: 'Dirección',
      value: 'Asistida',
    },
    {
      icon: <Armchair size={20} />,
      label: 'Interior',
      value: 'Cuero',
    },
    {
      icon: <Car size={20} />,
      label: 'Carrocería',
      value: 'SUV',
    },
  ];

  return (
    <div className={styles.specifications}>
      <div className={styles.priceSection}>
        <span className={styles.priceLabel}>Precio</span>
        <span className={styles.price}>{formatPrice(car.price)}</span>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Información General</h3>
        <div className={styles.specGrid}>
          {basicSpecs.map((spec) => (
            <div key={spec.label} className={styles.specItem}>
              <div className={styles.specIcon}>{spec.icon}</div>
              <div className={styles.specContent}>
                <span className={styles.specLabel}>{spec.label}</span>
                <span className={styles.specValue}>{spec.value}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Características</h3>
        <ul className={styles.featureList}>
          {car.features && car.features.length > 0 ? (
            car.features.map((feature, index) => (
              <li key={index} className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                {feature}
              </li>
            ))
          ) : (
            <>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                Aire acondicionado
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                Dirección asistida
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                Ventanas eléctricas
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureCheck}>✓</span>
                Cierre centralizado
              </li>
            </>
          )}
        </ul>
      </section>

      {car.description && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Descripción</h3>
          <p className={styles.description}>{car.description}</p>
        </section>
      )}
    </div>
  );
}
