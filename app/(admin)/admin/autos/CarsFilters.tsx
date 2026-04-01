'use client';

import { useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ADMIN_STATUS_OPTIONS } from '@/lib/constants/car-options';
import styles from './autos.module.css';

export default function CarsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentBrand = searchParams.get('brand') || '';
  const currentStatus = searchParams.get('status') || '';

  const navigate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', '1');
    router.push(`/admin/autos?${params.toString()}`);
  };

  // Selects fire immediately — the change is a single deliberate action
  const handleSelectChange = (key: string, value: string) => {
    navigate(key, value);
  };

  // Text inputs are debounced — wait 400ms after the user stops typing
  const handleTextChange = (key: string, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate(key, value), 400);
  };

  return (
    <div className={styles.filters}>
      <label htmlFor="filter-brand" className="sr-only">Filtrar por marca</label>
      <input
        id="filter-brand"
        type="text"
        placeholder="Buscar por marca..."
        defaultValue={currentBrand}
        onChange={(e) => handleTextChange('brand', e.target.value)}
        className={styles.filterInput}
      />

      <label htmlFor="filter-status" className="sr-only">Filtrar por estado</label>
      <select
        id="filter-status"
        value={currentStatus}
        onChange={(e) => handleSelectChange('status', e.target.value)}
        className={styles.filterSelect}
      >
        {ADMIN_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
