'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  Mail,
  CheckCircle2,
  Eye,
  X,
  Car,
  Calendar,
  Gauge,
  FileText,
  User,
  Clock,
  Tag,
  MapPin
} from 'lucide-react';
import { updateLeadStatus } from '@/app/actions/leads';
import AdminTable, { type Column } from '@/components/admin/AdminTable/AdminTable';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Portal from '@/components/ui/Portal/Portal';
import { notifySuccess, notifyError } from '@/lib/notifications';
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

interface ConsultasTableProps {
  leads: LeadRow[];
}

export default function ConsultasTable({ leads }: ConsultasTableProps) {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (!leadId) {
      notifyError('Error', 'ID de consulta inválido');
      return;
    }
    
    setUpdatingId(leadId);
    
    try {
      console.log('Updating lead:', leadId, 'to status:', newStatus);
      const result = await updateLeadStatus(leadId, newStatus);
      
      console.log('Result:', result);
      
      if (result.success) {
        notifySuccess('Éxito', `Consulta marcada como ${statusLabels[newStatus].toLowerCase()}`);
        // Use router.refresh() instead of window.location.reload()
        router.refresh();
      } else {
        console.error('Error updating lead status:', result.error);
        notifyError('Error', result.error || 'No se pudo actualizar la consulta');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      notifyError('Error', 'Error inesperado. Verificá tu conexión e intentá de nuevo.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getWhatsAppUrl = (lead: LeadRow) => {
    const cleanPhone = lead.phone.replace(/\D/g, '');
    const whatsappNumber = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;
    const message = `Hola ${lead.name}, soy de Boston Automotores. Recibimos tu consulta.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const getActionButtons = (row: LeadRow) => {
    const isUpdating = updatingId === row.id;

    return (
      <div className={styles.actionButtons}>
        {/* WhatsApp */}
        <a
          href={getWhatsAppUrl(row)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.iconButton} ${styles.whatsappButton}`}
          title="Contactar por WhatsApp"
        >
          <MessageCircle size={20} />
        </a>

        {/* Email */}
        <a
          href={`mailto:${row.email}?subject=Consulta Boston Automotores&body=Hola ${row.name},`}
          className={`${styles.iconButton} ${styles.emailButton}`}
          title="Enviar email"
        >
          <Mail size={20} />
        </a>

        {/* Mark as contacted */}
        {row.status === 'new' && (
          <button
            onClick={() => handleStatusChange(row.id, 'contacted')}
            className={`${styles.iconButton} ${styles.contactButton}`}
            disabled={isUpdating}
            title="Marcar como contactada"
          >
            <CheckCircle2 size={20} />
          </button>
        )}

        {row.status === 'contacted' && (
          <button
            onClick={() => handleStatusChange(row.id, 'closed')}
            className={`${styles.iconButton} ${styles.closeButton}`}
            disabled={isUpdating}
            title="Cerrar consulta"
          >
            <CheckCircle2 size={20} />
          </button>
        )}

        {row.status === 'closed' && (
          <button
            onClick={() => handleStatusChange(row.id, 'new')}
            className={`${styles.iconButton} ${styles.reopenButton}`}
            disabled={isUpdating}
            title="Reabrir consulta"
          >
            <Clock size={20} />
          </button>
        )}

        {/* View details */}
        <button
          onClick={() => setSelectedLead(row)}
          className={`${styles.iconButton} ${styles.viewButton}`}
          title="Ver detalles"
        >
          <Eye size={20} />
        </button>
      </div>
    );
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
        <span className={styles.emailText} title={row.email}>
          {row.email.length > 25 ? row.email.substring(0, 25) + '...' : row.email}
        </span>
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
    {
      key: 'actions',
      header: 'Acciones',
      render: (row) => getActionButtons(row),
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={leads}
        keyExtractor={(row) => row.id}
        emptyMessage="No hay consultas que mostrar"
      />

      {/* Detail Modal */}
      {selectedLead && (
        <Portal>
          <div className={styles.modalOverlay} onClick={() => setSelectedLead(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Detalles de la Consulta</h2>
                <button
                  className={styles.modalClose}
                  onClick={() => setSelectedLead(null)}
                >
                  <X size={24} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Status Badge */}
                <div className={styles.detailSection}>
                  <Badge variant={statusVariants[selectedLead.status]} size="md">
                    {statusLabels[selectedLead.status]}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <User size={18} />
                    Información de Contacto
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Nombre</span>
                      <span className={styles.detailValue}>{selectedLead.name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email</span>
                      <a href={`mailto:${selectedLead.email}`} className={styles.detailLink}>
                        {selectedLead.email}
                      </a>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Teléfono</span>
                      <a href={getWhatsAppUrl(selectedLead)} className={styles.detailLink} target="_blank" rel="noopener noreferrer">
                        {selectedLead.phone}
                      </a>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Fecha</span>
                      <span className={styles.detailValue}>
                        {new Date(selectedLead.createdAt).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <Tag size={18} />
                    Tipo de Consulta
                  </h3>
                  <Badge variant={selectedLead.type === 'sell_car' ? 'info' : 'default'}>
                    {typeLabels[selectedLead.type]}
                  </Badge>
                </div>

                {/* Car Details (if sell_car) */}
                {selectedLead.type === 'sell_car' && selectedLead.carBrand && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>
                      <Car size={18} />
                      Información del Vehículo
                    </h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Marca</span>
                        <span className={styles.detailValue}>{selectedLead.carBrand}</span>
                      </div>
                      {selectedLead.carModel && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Modelo</span>
                          <span className={styles.detailValue}>{selectedLead.carModel}</span>
                        </div>
                      )}
                      {selectedLead.carYear && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Año</span>
                          <span className={styles.detailValue}>{selectedLead.carYear}</span>
                        </div>
                      )}
                      {selectedLead.carMileage && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Kilometraje</span>
                          <span className={styles.detailValue}>
                            {selectedLead.carMileage.toLocaleString('es-AR')} km
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Message */}
                {selectedLead.message && (
                  <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>
                      <FileText size={18} />
                      Mensaje
                    </h3>
                    <div className={styles.messageBox}>
                      {selectedLead.message}
                    </div>
                  </div>
                )}

                {/* Source */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <MapPin size={18} />
                    Origen
                  </h3>
                  <span className={styles.detailValue}>{selectedLead.sourcePage}</span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <a
                  href={getWhatsAppUrl(selectedLead)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalButtonWhatsapp}
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className={styles.modalButtonEmail}
                >
                  <Mail size={18} />
                  Email
                </a>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
