import type { Metadata } from 'next';
import Link from 'next/link';
import { getLeads } from '@/app/actions/leads';
import ConsultasTable from './ConsultasTable';
import ConsultasFilters from './ConsultasFilters';
import Button from '@/components/ui/Button/Button';
import type { LeadRow, LeadStatus, LeadType } from './types';
import styles from './consultas.module.css';

export const metadata: Metadata = {
  title: 'Consultas | Boston Automotores',
  description: 'Administración de consultas y leads',
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

      <ConsultasFilters />

      <div className={styles.tableWrapper}>
        <ConsultasTable leads={leads} />
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Página {page} de {totalPages}
          </span>
          <div className={styles.pageButtons}>
            {page > 1 && (
              <Link href={buildUrl(page - 1)}>
                <Button variant="secondary" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={buildUrl(page + 1)}>
                <Button variant="secondary" size="sm">
                  Siguiente
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
