'use client';

import AdminTable, { type Column } from '@/components/admin/AdminTable/AdminTable';
import Badge from '@/components/ui/Badge/Badge';
import styles from './consultas.module.css';

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

const columns: Column<LeadRow>[] = [
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

interface ConsultasTableProps {
  leads: LeadRow[];
}

export default function ConsultasTable({ leads }: ConsultasTableProps) {
  return (
    <AdminTable
      columns={columns}
      data={leads}
      keyExtractor={(row) => row.id}
      emptyMessage="No hay consultas que mostrar"
    />
  );
}
