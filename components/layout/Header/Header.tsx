import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../Navigation/Navigation';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="Boston Automotores - Inicio">
          <Image
            src="/assets/logo-sin-fondo.png"
            alt="Boston Automotores"
            width={64}
            height={64}
            className={styles.logoImage}
            priority
          />
          <span className={styles.logoText}>Boston Automotores</span>
        </Link>

        <Navigation />
      </div>
    </header>
  );
}
