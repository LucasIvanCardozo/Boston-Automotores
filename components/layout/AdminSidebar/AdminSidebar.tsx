'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/admin';
import styles from './AdminSidebar.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/autos', label: 'Autos', icon: '🚗' },
  { href: '/admin/consultas', label: 'Consultas', icon: '📋' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/admin" className={styles.logoLink}>
          <span className={styles.logoIcon}>🏎️</span>
          <span className={styles.logoText}>Boston Admin</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={styles.footer}>
        <Link href="/" className={styles.viewSite}>
          <span>🌐</span>
          <span>Ver Sitio</span>
        </Link>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
