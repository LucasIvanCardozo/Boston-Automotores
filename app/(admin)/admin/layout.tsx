import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar/AdminSidebar';
import Toaster from '@/components/ui/Toaster/Toaster';
import styles from './layout.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and verify admin exists in database
  try {
    await requireAuth();
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.mainContent}>{children}</main>
      <Toaster position="top-right" />
    </div>
  );
}
