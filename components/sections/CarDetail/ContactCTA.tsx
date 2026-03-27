'use client';

import { MessageCircle, Phone, Mail, Clock } from 'lucide-react';
import styles from './ContactCTA.module.css';

interface ContactCTAProps {
  carName: string;
}

const phoneNumber = '+5492234567890';
const whatsappMessage = encodeURIComponent(`Hola! Me interesa el ${'vehiculo'}. ¿Está disponible?`);

export default function ContactCTA({ carName }: ContactCTAProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>¿Te interesa este vehículo?</h3>
      <p className={styles.subtitle}>
        Contactanos y te ayudamos a conseguir tu próximo auto
      </p>

      <div className={styles.actions}>
        <a
          href={`https://wa.me/${phoneNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappButton}
        >
          <MessageCircle size={20} />
          WhatsApp
        </a>

        <a
          href={`tel:${phoneNumber}`}
          className={styles.phoneButton}
        >
          <Phone size={20} />
          Llamar
        </a>

        <a
          href="mailto:info@bostonautomotores.com"
          className={styles.emailButton}
        >
          <Mail size={20} />
          Email
        </a>
      </div>

      <div className={styles.businessHours}>
        <Clock size={16} />
        <span>Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 13:00</span>
      </div>
    </div>
  );
}
