'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import styles from './consultas.module.css';

type LeadStatus = 'new' | 'contacted' | 'closed';
type LeadType = 'sell_car' | 'contact';

interface LeadDetailsProps {
  lead: {
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
  };
  onStatusChange?: (status: LeadStatus) => void;
  onDelete?: () => void;
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

export default function LeadDetails({ lead, onStatusChange, onDelete }: LeadDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange?.(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.details}>
      <div className={styles.detailsHeader}>
        <div>
          <h3 className={styles.detailsName}>{lead.name}</h3>
          <p className={styles.detailsDate}>
            Recibida el{' '}
            {new Date(lead.createdAt).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Badge variant={statusVariants[lead.status]}>
          {statusLabels[lead.status]}
        </Badge>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailsItem}>
          <span className={styles.detailsLabel}>Tipo de consulta</span>
          <span className={styles.detailsValue}>
            {typeLabels[lead.type]}
          </span>
        </div>

        <div className={styles.detailsItem}>
          <span className={styles.detailsLabel}>Email</span>
          <a href={`mailto:${lead.email}`} className={styles.detailsLink}>
            {lead.email}
          </a>
        </div>

        <div className={styles.detailsItem}>
          <span className={styles.detailsLabel}>Teléfono</span>
          <a href={`tel:${lead.phone}`} className={styles.detailsLink}>
            {lead.phone}
          </a>
        </div>

        <div className={styles.detailsItem}>
          <span className={styles.detailsLabel}>Página de origen</span>
          <span className={styles.detailsValue}>{lead.sourcePage}</span>
        </div>

        {lead.type === 'sell_car' && (
          <>
            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Marca del auto</span>
              <span className={styles.detailsValue}>{lead.carBrand}</span>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Modelo</span>
              <span className={styles.detailsValue}>{lead.carModel}</span>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Año</span>
              <span className={styles.detailsValue}>{lead.carYear}</span>
            </div>

            <div className={styles.detailsItem}>
              <span className={styles.detailsLabel}>Kilometraje</span>
              <span className={styles.detailsValue}>
                {lead.carMileage?.toLocaleString('es-AR')} km
              </span>
            </div>
          </>
        )}

        {lead.message && (
          <div className={`${styles.detailsItem} ${styles.fullWidth}`}>
            <span className={styles.detailsLabel}>Mensaje</span>
            <p className={styles.detailsMessage}>{lead.message}</p>
          </div>
        )}
      </div>

      <div className={styles.detailsActions}>
        <div className={styles.statusActions}>
          <span className={styles.detailsLabel}>Cambiar estado:</span>
          <div className={styles.statusButtons}>
            <Button
              variant={lead.status === 'new' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleStatusChange('new')}
              disabled={isUpdating || lead.status === 'new'}
            >
              Nueva
            </Button>
            <Button
              variant={lead.status === 'contacted' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleStatusChange('contacted')}
              disabled={isUpdating || lead.status === 'contacted'}
            >
              Contactada
            </Button>
            <Button
              variant={lead.status === 'closed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleStatusChange('closed')}
              disabled={isUpdating || lead.status === 'closed'}
            >
              Cerrada
            </Button>
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}
