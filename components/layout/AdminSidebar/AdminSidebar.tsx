'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Car, ClipboardList, Globe, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/admin';
import styles from './AdminSidebar.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/admin/autos', label: 'Autos', icon: <Car size={20} /> },
  { href: '/admin/consultas', label: 'Consultas', icon: <ClipboardList size={20} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className={styles.mobileHeader}>
        <Link href="/admin" className={styles.mobileLogo} onClick={closeMenu}>
          <span className={styles.logoIcon}>🏎️</span>
          <span className={styles.logoText}>Boston Admin</span>
        </Link>
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Side Navigation */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarInner}>
          {/* Desktop Logo */}
          <div className={styles.logo}>
            <Link href="/admin" className={styles.logoLink} onClick={closeMenu}>
              <span className={styles.logoIcon}>🏎️</span>
              <span className={styles.logoText}>Boston Admin</span>
            </Link>
          </div>

          {/* Navigation */}
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
                      onClick={closeMenu}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className={styles.footer}>
            <Link href="/" className={styles.viewSite} onClick={closeMenu}>
              <Globe size={18} />
              <span>Ver Sitio</span>
            </Link>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
}
