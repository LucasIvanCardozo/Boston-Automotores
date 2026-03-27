import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getLeads, updateLeadStatus, deleteLead } from '@/app/actions/leads';
import AdminTable from '@/components/admin/AdminTable/AdminTable';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import Modal from '@/components/ui/Modal/Modal';
import LeadDetails from './LeadDetails';
import styles from './consultas.module.css';

export const metadata: Metadata = {
  title: 'Consultas | Boston Automotores',
  description: 'Administración de consultas y leads',
};

type LeadStatus = 'new' | 'contacted' | 'closed';
type LeadType = 'sell_car' | 'contact';

interface LeadRow {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  sourcePage: string;
  createdAt: Date;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  carMileage?: number;
  message?: string;
}

interface Column {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: LeadRow) => React.ReactNode;
}

const statusVariants: Record<LeadStatus, 'primary' | 'warning' | 'success'> = {
  new: 'primary',
  contacted: 'warning',
  closed: 'success',
};

const statusLabels: Record<LeadStatus, string> = {
  new: 'Nueva',
  contacted: 'Contactada',
  closed: 'Cerrada',
};

const typeLabels: Record<LeadType, string> = {
  sell_car: 'Vende su auto',
  contact: 'Contacto',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: LeadStatus;
    type?: LeadType;
    search?: string;
  }>;
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = parseInt(params.page || '1', 10);
  const status = params.status || undefined;
  const type = params.type || undefined;
  const search = params.search || undefined;

  const result = await getLeads(
    { status, type, search },
    { page, limit: 20 }
  );

  const leads: LeadRow[] = (result.leads || []).map((lead: Record<string, unknown>) => ({
    id: lead.id as string,
    type: lead.type as LeadType,
    name: lead.name as string,
    email: lead.email as string,
    phone: lead.phone as string,
    status: lead.status as LeadStatus,
    sourcePage: lead.sourcePage as string,
    createdAt: lead.createdAt as Date,
    carBrand: lead.carBrand as string | undefined,
    carModel: lead.carModel as string | undefined,
    carYear: lead.carYear as number | undefined,
    carMileage: lead.carMileage as number | undefined,
    message: lead.message as string | undefined,
  }));

  const total = result.total || 0;
  const totalPages = Math.ceil(total / 20);

  const columns: Column[] = [
    {
      key: 'createdAt',
      header: 'Fecha',
      sortable: true,
      render: (row) => (
        <span className={styles.date}>
          {new Date(row.createdAt).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => (
        <Badge variant={row.type === 'sell_car' ? 'info' : 'default'}>
          {typeLabels[row.type]}
        </Badge>
      ),
    },
    {
      key: 'name',
      header: 'Nombre',
      render: (row) => <span className={styles.name}>{row.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <a href={`mailto:${row.email}`} className={styles.email}>
          {row.email}
        </a>
      ),
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (row) => (
        <a href={`tel:${row.phone}`} className={styles.phone}>
          {row.phone}
        </a>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) => (
        <Badge variant={statusVariants[row.status]}>
          {statusLabels[row.status]}
        </Badge>
      ),
    },
  ];

  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set('page', pageNum.toString());
    if (status) params.set('status', status);
    if (type) params.set('type', type);
    if (search) params.set('search', search);
    return `/admin/consultas?${params.toString()}`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Consultas</h1>
          <p className={styles.subtitle}>
            {total} consulta{total !== 1 ? 's' : ''} en total
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <form method="get" className={styles.filterForm}>
          <input
            type="text"
            name="search"
            placeholder="Buscar por nombre, email o teléfono..."
            defaultValue={search}
            className={styles.searchInput}
          />
          <select
            name="status"
            defaultValue={status || ''}
            className={styles.filterSelect}
          >
            <option value="">Todos los estados</option>
            <option value="new">Nueva</option>
            <option value="contacted">Contactada</option>
            <option value="closed">Cerrada</option>
          </select>
          <select
            name="type"
            defaultValue={type || ''}
            className={styles.filterSelect}
          >
            <option value="">Todos los tipos</option>
            <option value="contact">Contacto</option>
            <option value="sell_car">Vende su auto</option>
          </select>
          <Button type="submit" variant="secondary" size="sm">
            Filtrar
          </Button>
        </form>
      </div>

      <div className={styles.tableWrapper}>
        <AdminTable
          columns={columns}
          data={leads}
          keyExtractor={(row) => row.id}
          emptyMessage="No hay consultas que mostrar"
        />
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Página {page} de {totalPages}
          </span>
          <div className={styles.pageButtons}>
            {page > 1 && (
              <a href={buildUrl(page - 1)}>
                <Button variant="secondary" size="sm">
                  Anterior
                </Button>
              </a>
            )}
            {page < totalPages && (
              <a href={buildUrl(page + 1)}>
                <Button variant="secondary" size="sm">
                  Siguiente
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
