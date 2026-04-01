'use client';

import { useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './consultas.module.css';

export default function ConsultasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStatus = searchParams.get('status') || '';
  const currentType = searchParams.get('type') || '';
  const currentSearch = searchParams.get('search') || '';

  const navigate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`/admin/consultas?${params.toString()}`);
  };

  const handleSelectChange = (key: string, value: string) => {
    navigate(key, value);
  };

  const handleTextChange = (key: string, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(key, value), 400);
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterForm}>
        <input
          type="text"
          name="search"
          placeholder="Buscar por nombre, email o teléfono..."
          defaultValue={currentSearch}
          onChange={(e) => handleTextChange('search', e.target.value)}
          className={styles.searchInput}
        />
        <select
          name="status"
          value={currentStatus}
          onChange={(e) => handleSelectChange('status', e.target.value)}
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
          onChange={(e) => handleSelectChange('type', e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Todos los tipos</option>
          <option value="contact">Contacto</option>
          <option value="sell_car">Vende su auto</option>
        </select>
      </div>
    </div>
  );
}
