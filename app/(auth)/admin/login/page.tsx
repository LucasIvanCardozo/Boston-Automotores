import { Suspense } from 'react';
import LoginForm from '@/components/admin/LoginForm/LoginForm';
import styles from './login.module.css';

function LoginError({ error }: { error: string }) {
  return <LoginForm error={error} />;
}

function LoginFormWrapper() {
  return <LoginForm />;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>🏎️</div>
          <h1 className={styles.title}>Boston Admin</h1>
          <p className={styles.subtitle}>Ingrese sus credenciales para acceder</p>
        </div>

        <div className={styles.formContainer}>
          <Suspense fallback={<LoginFormWrapper />}>
            {error ? (
              <LoginError error={error} />
            ) : (
              <LoginFormWrapper />
            )}
          </Suspense>
        </div>
      </div>

      <div className={styles.footer}>
        <p>© 2024 Boston Automotores. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
