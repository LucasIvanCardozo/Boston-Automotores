'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';
import styles from './LocationMap.module.css';

const businessInfo = {
  address: 'Av. Colón 4469, Mar del Plata, Argentina',
  phone: '+54 9 223 632-9761',
  email: 'bostonautomotores@hotmail.com',
  hours: 'Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 13:00',
};

export default function LocationMap() {
  // Proper Google Maps embed URL for Av. Colón 4469, Mar del Plata
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3142.4769!2d-57.5712!3d-38.0176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9584dec4cd4f9d0b%3A0x2b0a2c1e45c9b!2sAv.%20Col%C3%B3n%204469%2C%20Mar%20del%20Plata!5e0!3m2!1ses!2sar!4v1704067200000!5m2!1ses!2sar`;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className={styles.header}
        >
          <h2 className={styles.title}>Dónde Estamos</h2>
          <p className={styles.subtitle}>
            Visitanos en nuestro local o contactanos por los medios disponibles
          </p>
        </motion.div>

        <div className={styles.content}>
          <motion.div
            className={styles.mapWrapper}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <iframe
              src={mapUrl}
              className={styles.map}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Boston Automotores"
            />
          </motion.div>

          <motion.div
            className={styles.info}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <MapPin size={20} className={styles.icon} />
                <div>
                  <h4 className={styles.infoLabel}>Dirección</h4>
                  <p className={styles.infoValue}>{businessInfo.address}</p>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Phone size={20} className={styles.icon} />
                <div>
                  <h4 className={styles.infoLabel}>Teléfono</h4>
                  <a href={`tel:${businessInfo.phone}`} className={styles.infoLink}>
                    {businessInfo.phone}
                  </a>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Mail size={20} className={styles.icon} />
                <div>
                  <h4 className={styles.infoLabel}>Email</h4>
                  <a
                    href={`mailto:${businessInfo.email}`}
                    className={styles.infoLink}
                  >
                    {businessInfo.email}
                  </a>
                </div>
              </div>

              <div className={styles.infoItem}>
                <Clock size={20} className={styles.icon} />
                <div>
                  <h4 className={styles.infoLabel}>Horarios</h4>
                  <p className={styles.infoValue}>{businessInfo.hours}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
