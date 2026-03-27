import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar/AdminSidebar';
import styles from './layout.module.css';

const ADMIN_COOKIE_NAME = 'admin_session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  
  if (!token || !verifyToken(token)) {
    redirect('/admin/login');
  }

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
