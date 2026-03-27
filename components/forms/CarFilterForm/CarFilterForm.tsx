'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useCallback, useTransition } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import styles from './CarFilterForm.module.css';

const brands = [
  'Audi', 'BMW', 'Chevrolet', 'Citroën', 'Fiat', 'Ford', 'Honda', 'Hyundai',
  'Jeep', 'Kia', 'Mercedes-Benz', 'Nissan', 'Peugeot',
  'Renault', 'Toyota', 'Volkswagen', 'Volvo',
];

const fuelTypes = [
  { value: 'nafta', label: 'Nafta' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electrico', label: 'Eléctrico' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'gnc', label: 'GNC' },
];

const transmissions = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatica', label: 'Automática' },
  { value: 'cvt', label: 'CVT' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1999 }, (_, i) => currentYear - i);

export default function CarFilterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current filters from URL
  const getFiltersFromURL = useCallback(() => ({
    brand: searchParams.get('brand') || '',
    minYear: searchParams.get('minYear') || '',
    maxYear: searchParams.get('maxYear') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    maxMileage: searchParams.get('maxMileage') || '',
    fuelType: searchParams.get('fuelType') || '',
    transmission: searchParams.get('transmission') || '',
  }), [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromURL);

  // Update URL with filters using replace
  const updateURL = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '0') {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use startTransition for smooth UI updates
    startTransition(() => {
      router.replace(newURL, { scroll: false });
    });
  }, [pathname, router]);

  // Handle filter change - updates state and URL immediately
  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Reset all filters
  const handleReset = () => {
    const emptyFilters = {
      brand: '',
      minYear: '',
      maxYear: '',
      minPrice: '',
      maxPrice: '',
      maxMileage: '',
      fuelType: '',
      transmission: '',
    };
    setFilters(emptyFilters);
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className={styles.wrapper}>
      {/* Mobile Toggle */}
      <button
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <SlidersHorizontal size={18} />
        Filtros
        {activeFilterCount > 0 && (
          <span className={styles.filterCount}>{activeFilterCount}</span>
        )}
      </button>

      {/* Filter Form */}
      <div className={`${styles.form} ${isExpanded ? styles.formExpanded : ''}`}>
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>Filtrar Autos</h3>
          <button
            className={styles.closeButton}
            onClick={() => setIsExpanded(false)}
            aria-label="Cerrar filtros"
          >
            <X size={20} />
          </button>
        </div>

        {isPending && (
          <div className={styles.loadingIndicator}>
            Actualizando...
          </div>
        )}

        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.field}>
            <label htmlFor="brand" className={styles.label}>Marca</label>
            <select
              id="brand"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className={styles.select}
            >
              <option value="">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div className={styles.field}>
            <label htmlFor="fuelType" className={styles.label}>Combustible</label>
            <select
              id="fuelType"
              value={filters.fuelType}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className={styles.select}
            >
              <option value="">Todos</option>
              {fuelTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div className={styles.field}>
            <label htmlFor="transmission" className={styles.label}>Transmisión</label>
            <select
              id="transmission"
              value={filters.transmission}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className={styles.select}
            >
              <option value="">Todas</option>
              {transmissions.map((trans) => (
                <option key={trans.value} value={trans.value}>{trans.label}</option>
              ))}
            </select>
          </div>

          {/* Year Range */}
          <div className={styles.field}>
            <label className={styles.label}>Año desde</label>
            <select
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
              className={styles.select}
            >
              <option value="">Cualquiera</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Año hasta</label>
            <select
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
              className={styles.select}
            >
              <option value="">Cualquiera</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className={styles.field}>
            <label className={styles.label}>Precio mínimo</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="Ej: 5000000"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Precio máximo</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="Ej: 20000000"
              className={styles.input}
            />
          </div>

          {/* Mileage */}
          <div className={styles.field}>
            <label className={styles.label}>Kilometraje máximo</label>
            <input
              type="number"
              value={filters.maxMileage}
              onChange={(e) => handleFilterChange('maxMileage', e.target.value)}
              placeholder="Ej: 50000"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Limpiar filtros
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsExpanded(false)}>
            Ver resultados
          </Button>
        </div>
      </div>
    </div>
  );
}
