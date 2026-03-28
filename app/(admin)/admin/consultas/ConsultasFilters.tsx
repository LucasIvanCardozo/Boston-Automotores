'use client';

import { useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './consultas.module.css';

export default function ConsultasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get('status') || '';
  const currentType = searchParams.get('type') || '';
  const currentSearch = searchParams.get('search') || '';

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      
      // Reset to page 1 when filters change
      params.set('page', '1');
      
      router.push(`/admin/consultas?${params.toString()}`);
    });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterForm}>
        <input
          type="text"
          name="search"
          placeholder="Buscar por nombre, email o teléfono..."
          defaultValue={currentSearch}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className={styles.searchInput}
        />
        <select
          name="status"
          value={currentStatus}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Todos los estados</option>
          <option value="new">Nueva</option>
          <option value="contacted">Contactada</option>
          <option value="closed">Cerrada</option>
        </select>
        <select
          name="type"
          value={currentType}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Todos los tipos</option>
          <option value="contact">Contacto</option>
          <option value="sell_car">Vende su auto</option>
        </select>
        {isPending && <span className={styles.loadingIndicator}>Actualizando...</span>}
      </div>
    </div>
  );
}
