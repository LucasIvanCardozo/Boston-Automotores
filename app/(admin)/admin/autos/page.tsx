'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAdminCars } from '@/app/actions/cars';
import AdminTable from '@/components/admin/AdminTable/AdminTable';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import Loading from '@/components/ui/Loading/Loading';
import styles from './autos.module.css';

type CarStatus = 'available' | 'sold' | 'reserved';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: CarStatus;
  featured: boolean;
  deletedAt: Date | null;
  images: { url: string }[];
  createdAt: Date;
}

const statusVariants: Record<CarStatus, 'success' | 'error' | 'warning'> = {
  available: 'success',
  sold: 'error',
  reserved: 'warning',
};

const statusLabels: Record<CarStatus, string> = {
  available: 'Disponible',
  sold: 'Vendido',
  reserved: 'Reservado',
};

export default function AdminCarsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const brand = searchParams.get('brand') || '';
  const status = (searchParams.get('status') || '') as CarStatus | '';
  const includeDeleted = searchParams.get('deleted') === 'true';

  const totalPages = Math.ceil(total / 20);

  useEffect(() => {
    async function loadCars() {
      setLoading(true);
      const result = await getAdminCars({
        page,
        sortBy: sortBy as 'createdAt' | 'price' | 'year',
        sortOrder,
        brand: brand || undefined,
        status: status || undefined,
        includeDeleted,
      });
      
      setCars((result.cars || []).map((car: Record<string, unknown>) => ({
        ...car,
        price: Number(car.price),
      })) as Car[]);
      setTotal(result.total || 0);
      setLoading(false);
    }
    
    loadCars();
  }, [page, sortBy, sortOrder, brand, status, includeDeleted]);

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', key);
    params.set('sortOrder', order);
    router.push(`/admin/autos?${params.toString()}`);
  };

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNum.toString());
    return `/admin/autos?${params.toString()}`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestionar Autos</h1>
          <p className={styles.subtitle}>
            {total} vehículo{total !== 1 ? 's' : ''} en inventario
          </p>
        </div>
        <Link href="/admin/autos/nuevo">
          <Button leftIcon="+">Nuevo Auto</Button>
        </Link>
      </header>

      <div className={styles.filters}>
        <form 
          method="get" 
          className={styles.filterForm}
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const params = new URLSearchParams();
            params.set('page', '1');
            if (formData.get('brand')) params.set('brand', formData.get('brand') as string);
            if (formData.get('status')) params.set('status', formData.get('status') as string);
            if (formData.get('deleted')) params.set('deleted', 'true');
            router.push(`/admin/autos?${params.toString()}`);
          }}
        >
          <input
            type="text"
            name="brand"
            placeholder="Buscar por marca..."
            defaultValue={brand}
            className={styles.searchInput}
          />
          <select
            name="status"
            defaultValue={status}
            className={styles.filterSelect}
          >
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="sold">Vendido</option>
            <option value="reserved">Reservado</option>
          </select>
          <label className={styles.deletedCheck}>
            <input
              type="checkbox"
              name="deleted"
              value="true"
              defaultChecked={includeDeleted}
            />
            Mostrar eliminados
          </label>
          <Button type="submit" variant="secondary" size="sm">
            Filtrar
          </Button>
        </form>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loading}>
            <Loading />
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Marca/Modelo</th>
                <th onClick={() => handleSort('year', sortOrder === 'asc' ? 'desc' : 'asc')}>
                  Año {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('price', sortOrder === 'asc' ? 'desc' : 'asc')}>
                  Precio {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Estado</th>
                <th>Destacado</th>
                <th onClick={() => handleSort('createdAt', sortOrder === 'asc' ? 'desc' : 'asc')}>
                  Creado {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cars.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.empty}>No hay vehículos</td>
                </tr>
              ) : (
                cars.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <div className={styles.carCell}>
                        <span className={styles.brand}>{car.brand}</span>
                        <span className={styles.model}>{car.model}</span>
                      </div>
                    </td>
                    <td>{car.year}</td>
                    <td>${car.price.toLocaleString('es-AR')}</td>
                    <td>
                      <Badge variant={statusVariants[car.status]}>
                        {statusLabels[car.status]}
                      </Badge>
                    </td>
                    <td>{car.featured ? '⭐' : '—'}</td>
                    <td>{new Date(car.createdAt).toLocaleDateString('es-AR')}</td>
                    <td>
                      <Link href={`/admin/autos/${car.id}/editar`}>
                        <Button size="sm" variant="secondary">Editar</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Página {page} de {totalPages}
          </span>
          <div className={styles.pageButtons}>
            {page > 1 && (
              <Link href={buildUrl(page - 1)}>
                <Button variant="secondary" size="sm">Anterior</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl(page + 1)}>
                <Button variant="secondary" size="sm">Siguiente</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
