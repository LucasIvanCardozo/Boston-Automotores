import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import styles from './dashboard.module.css';

interface DashboardStats {
  totalCars: number;
  availableCars: number;
  totalLeads: number;
  newLeads: number;
  totalAdmins: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const [totalCars, availableCars, totalLeads, newLeads, totalAdmins] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: 'available' } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'new' } }),
    prisma.admin.count(),
  ]);

  return {
    totalCars,
    availableCars,
    totalLeads,
    newLeads,
    totalAdmins,
  };
}

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
          <a href="/admin/autos" className={styles.actionCard}>
            <span className={styles.actionIcon}>🚗</span>
            <span className={styles.actionLabel}>Gestionar Autos</span>
          </a>
          <a href="/admin/consultas" className={styles.actionCard}>
            <span className={styles.actionIcon}>📋</span>
            <span className={styles.actionLabel}>Ver Consultas</span>
          </a>
          <a href="/" className={styles.actionCard}>
            <span className={styles.actionIcon}>🌐</span>
            <span className={styles.actionLabel}>Ver Sitio</span>
          </a>
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
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
