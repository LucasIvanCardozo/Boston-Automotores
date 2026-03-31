import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, ADMIN_COOKIE_OPTIONS } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar/AdminSidebar';
import Toaster from '@/components/ui/Toaster/Toaster';
import styles from './layout.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_OPTIONS.name)?.value;

  let isAuthenticated = false;
  try {
    isAuthenticated = !!token && !!verifyToken(token);
  } catch {
    isAuthenticated = false;
  }

  if (!isAuthenticated) {
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
