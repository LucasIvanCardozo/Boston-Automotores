import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/data/dashboard';
import styles from './dashboard.module.css';

export default async function AdminDashboardPage() {
  const session = await getSession();
  const stats = await getDashboardStats();

  const greeting = getGreeting();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {greeting}, {session?.username}
          </h1>
          <p className={styles.subtitle}>
            Bienvenido al panel de administración de Boston Automotores
          </p>
        </div>
        <div className={styles.roleBadge}>
          {session?.role === 'super_admin' ? 'Super Admin' : 'Administrador'}
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚗</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalCars}</span>
            <span className={styles.statLabel}>Total de Autos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.availableCars}</span>
            <span className={styles.statLabel}>Autos Disponibles</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📋</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalLeads}</span>
            <span className={styles.statLabel}>Total Consultas</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🆕</div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.newLeads}</span>
            <span className={styles.statLabel}>Consultas Nuevas</span>
          </div>
        </div>
      </section>

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/autos" className={styles.actionCard}>
            <span className={styles.actionIcon}>🚗</span>
            <span className={styles.actionLabel}>Gestionar Autos</span>
          </Link>
          <Link href="/admin/consultas" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>Ver Consultas</span>
          </Link>
          <Link href="/" className={styles.actionCard}>
            <span className={styles.actionIcon}>🌐</span>
            <span className={styles.actionLabel}>Ver Sitio</span>
          </Link>
        </div>
      </section>

      <section className={styles.recentActivity}>
        <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <p>No hay actividad reciente para mostrar.</p>
          <p className={styles.emptyHint}>
            Las consultas de clientes aparecerán aquí.
          </p>
        </div>
      </section>
    </div>
  );
}

function getGreeting(): string {
  // Use Buenos Aires timezone (UTC-3) for accurate time-of-day greetings
  const hour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })
  ).getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
