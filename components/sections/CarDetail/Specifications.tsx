import { Car, Fuel, Calendar, Gauge, Settings, Droplets, CircleGauge, DoorOpen, Disc, Volume2, Lightbulb, ShieldCheck, Sofa, Radio } from 'lucide-react';
import styles from './Specifications.module.css';
import type { CarSpecs } from '@/lib/schemas/car';

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
    specs?: CarSpecs | null;
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

const steeringLabels: Record<string, string> = {
  mecanica: 'Mecánica',
  hidraulica: 'Hidráulica',
  electronica: 'Electrónica',
  'electro-hidraulica': 'Electro-hidráulica',
};

const headlightsLabels: Record<string, string> = {
  halogenos: 'Halógenos',
  led: 'LED',
  xenon: 'Xenón',
  laser: 'Láser',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);

const formatMileage = (mileage: number) =>
  new Intl.NumberFormat('es-AR').format(mileage);

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

  // Build technical spec rows only from real data
  const specs = car.specs;
  const technicalRows: { icon: React.ReactNode; label: string; value: string }[] = [];

  if (specs?.engine) {
    technicalRows.push({ icon: <CircleGauge size={18} />, label: 'Motor', value: specs.engine });
  }
  if (specs?.steering) {
    technicalRows.push({ icon: <Droplets size={18} />, label: 'Dirección', value: steeringLabels[specs.steering] || specs.steering });
  }
  if (specs?.color) {
    technicalRows.push({ icon: <Car size={18} />, label: 'Color', value: specs.color });
  }
  if (specs?.doors) {
    technicalRows.push({ icon: <DoorOpen size={18} />, label: 'Puertas', value: String(specs.doors) });
  }
  if (specs?.wheels) {
    technicalRows.push({ icon: <Disc size={18} />, label: 'Llantas', value: specs.wheels });
  }
  if (specs?.wheelSize) {
    technicalRows.push({ icon: <Disc size={18} />, label: 'Tamaño de llantas', value: specs.wheelSize });
  }
  if (specs?.audioSystem) {
    technicalRows.push({ icon: <Volume2 size={18} />, label: 'Audio', value: specs.audioSystem });
  }
  if (specs?.headlights) {
    technicalRows.push({ icon: <Lightbulb size={18} />, label: 'Faros', value: headlightsLabels[specs.headlights] || specs.headlights });
  }

  const hasTechnicalSpecs = technicalRows.length > 0;
  const hasSensors = specs?.sensors && specs.sensors.length > 0;
  const hasSecurity = specs?.securityFeatures && specs.securityFeatures.length > 0;
  const hasComfort = specs?.comfortFeatures && specs.comfortFeatures.length > 0;
  const hasAnySpecs = hasTechnicalSpecs || hasSensors || hasSecurity || hasComfort;

  return (
    <div className={styles.specifications}>
      <div className={styles.priceSection}>
        <span className={styles.priceLabel}>Precio</span>
        <span className={styles.price}>{formatPrice(car.price)}</span>
      </div>

      {/* Basic info — 4 chips, no wrap allowed */}
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

      {/* Technical specs — only rendered when the car actually has specs */}
      {hasAnySpecs && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Especificaciones Técnicas</h3>

          {hasTechnicalSpecs && (
            <ul className={styles.techList}>
              {technicalRows.map((row) => (
                <li key={row.label} className={styles.techItem}>
                  <span className={styles.techIcon}>{row.icon}</span>
                  <span className={styles.techLabel}>{row.label}</span>
                  <span className={styles.techValue}>{row.value}</span>
                </li>
              ))}
            </ul>
          )}

          {hasSensors && (
            <div className={styles.chipGroup}>
              <span className={styles.chipGroupTitle}>
                <Radio size={14} /> Sensores
              </span>
              <div className={styles.chips}>
                {specs!.sensors!.map((s) => (
                  <span key={s} className={styles.chip}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {hasSecurity && (
            <div className={styles.chipGroup}>
              <span className={styles.chipGroupTitle}>
                <ShieldCheck size={14} /> Seguridad
              </span>
              <div className={styles.chips}>
                {specs!.securityFeatures!.map((s) => (
                  <span key={s} className={styles.chip}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {hasComfort && (
            <div className={styles.chipGroup}>
              <span className={styles.chipGroupTitle}>
                <Sofa size={14} /> Confort
              </span>
              <div className={styles.chips}>
                {specs!.comfortFeatures!.map((s) => (
                  <span key={s} className={styles.chip}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

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
  );
}
