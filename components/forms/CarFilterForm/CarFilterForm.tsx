'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback, useTransition } from 'react';
import { Search, X, SlidersHorizontal, Car, DollarSign, Gauge } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import styles from './CarFilterForm.module.css';

interface Filters {
  brand: string;
  maxPrice: string;
  maxMileage: string;
}

interface CarFilterFormProps {
  availableBrands: string[];
}

export default function CarFilterForm({ availableBrands }: CarFilterFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Get current filters from URL
  const getFiltersFromURL = useCallback((): Filters => ({
    brand: searchParams.get('brand') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    maxMileage: searchParams.get('maxMileage') || '',
  }), [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromURL);

  // Update URL with filters using replace
  const updateURL = useCallback((newFilters: Filters) => {
    const params = new URLSearchParams();
    
    if (newFilters.brand) params.set('brand', newFilters.brand);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.maxMileage) params.set('maxMileage', newFilters.maxMileage);

    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    
    startTransition(() => {
      router.replace(newURL, { scroll: false });
    });
  }, [pathname, router]);

  // Handle filter change - updates state and URL immediately
  const handleFilterChange = (field: keyof Filters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Reset all filters
  const handleReset = () => {
    const emptyFilters: Filters = {
      brand: '',
      maxPrice: '',
      maxMileage: '',
    };
    setFilters(emptyFilters);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Build pagination URLs with current filters
  const buildPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    if (filters.maxMileage) params.set('maxMileage', filters.maxMileage);
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <>
      {/* Desktop: Inline filter row */}
      <div className={styles.filterRow}>
        {/* Brand */}
        <div className={styles.filterField}>
          <label htmlFor="brand" className={styles.filterLabel}>
            <Car size={14} />
            Marca
          </label>
          <select
            id="brand"
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas las marcas</option>
            {availableBrands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Max Price */}
        <div className={styles.filterField}>
          <label htmlFor="maxPrice" className={styles.filterLabel}>
            <DollarSign size={14} />
            Precio máximo
          </label>
          <input
            type="number"
            id="maxPrice"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            placeholder="Ej: 15000000"
            className={styles.filterInput}
          />
        </div>

        {/* Max Mileage */}
        <div className={styles.filterField}>
          <label htmlFor="maxMileage" className={styles.filterLabel}>
            <Gauge size={14} />
            Kilometraje máximo
          </label>
          <input
            type="number"
            id="maxMileage"
            value={filters.maxMileage}
            onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
            placeholder="Ej: 50000"
            className={styles.filterInput}
          />
        </div>

        {/* Actions */}
        <div className={styles.filterActions}>
          <button
            type="button"
            onClick={handleReset}
            className={`${styles.filterButton} ${styles.filterButtonSecondary}`}
            disabled={activeFilterCount === 0}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Mobile: Toggle button */}
      <button
        type="button"
        className={styles.mobileFilterToggle}
        onClick={() => setIsDrawerOpen(true)}
      >
        <SlidersHorizontal size={18} />
        Filtros
        {activeFilterCount > 0 && (
          <span className={styles.filterCount}>{activeFilterCount}</span>
        )}
      </button>

      {/* Mobile: Filter drawer */}
      <div className={`${styles.filterDrawer} ${isDrawerOpen ? styles.filterDrawerOpen : ''}`}>
        <div 
          className={styles.filterDrawerBackdrop} 
          onClick={() => setIsDrawerOpen(false)} 
        />
        <div className={styles.filterDrawerContent}>
          <div className={styles.filterDrawerHandle} />
          
          <div className={styles.filterDrawerHeader}>
            <h3 className={styles.filterDrawerTitle}>Filtros</h3>
            <button
              type="button"
              className={styles.filterDrawerClose}
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          {isPending && (
            <div className={styles.loadingIndicator}>
              Actualizando...
            </div>
          )}

          <div className={styles.filterDrawerGrid}>
            {/* Brand */}
            <div className={styles.filterDrawerField}>
              <label htmlFor="mobile-brand" className={styles.filterLabel}>
                <Car size={14} />
                Marca
              </label>
              <select
                id="mobile-brand"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas las marcas</option>
                {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div className={styles.filterDrawerField}>
              <label htmlFor="mobile-maxPrice" className={styles.filterLabel}>
                <DollarSign size={14} />
                Precio máximo
              </label>
              <input
                type="number"
                id="mobile-maxPrice"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Ej: 15000000"
                className={styles.filterInput}
              />
            </div>

            {/* Max Mileage */}
            <div className={styles.filterDrawerField}>
              <label htmlFor="mobile-maxMileage" className={styles.filterLabel}>
                <Gauge size={14} />
                Kilometraje máximo
              </label>
              <input
                type="number"
                id="mobile-maxMileage"
                value={filters.maxMileage}
                onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
                placeholder="Ej: 50000"
                className={styles.filterInput}
              />
            </div>
          </div>

          <div className={styles.filterDrawerActions}>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleReset}
            >
              Limpiar
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsDrawerOpen(false)}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>

      {/* Active filter tags (shown when filters are active) */}
      {activeFilterCount > 0 && (
        <div className={styles.activeFilters}>
          {filters.brand && (
            <span className={styles.activeFilterTag}>
              {filters.brand}
              <button onClick={() => handleFilterChange('brand', '')} aria-label="Quitar filtro">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className={styles.activeFilterTag}>
              Hasta ${parseInt(filters.maxPrice).toLocaleString('es-AR')}
              <button onClick={() => handleFilterChange('maxPrice', '')} aria-label="Quitar filtro">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.maxMileage && (
            <span className={styles.activeFilterTag}>
              {parseInt(filters.maxMileage).toLocaleString('es-AR')} km
              <button onClick={() => handleFilterChange('maxMileage', '')} aria-label="Quitar filtro">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );
}
