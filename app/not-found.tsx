import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Car, Info, AlertCircle } from 'lucide-react';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Página No Encontrada | Boston Automotores',
  description:
    'La página que buscas no existe. Explora nuestro catálogo de autos usados en Mar del Plata.',
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.iconWrapper}>
            <AlertCircle size={64} className={styles.icon} />
          </div>
          <h1 className={styles.title}>Página No Encontrada</h1>
          <p className={styles.description}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
            Quizás puedes encontrar lo que buscas en alguna de nuestras secciones.
          </p>
          <div className={styles.navigation}>
            <Link href="/" className={styles.link}>
              <Home size={20} />
              <span>Inicio</span>
            </Link>
            <Link href="/catalogo" className={styles.link}>
              <Car size={20} />
              <span>Catálogo</span>
            </Link>
            <Link href="/nosotros" className={styles.link}>
              <Info size={20} />
              <span>Nosotros</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
