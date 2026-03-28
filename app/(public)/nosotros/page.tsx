import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, Users, Award, ThumbsUp, Car } from 'lucide-react';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Nosotros',
  description:
    'Conocé Boston Automotores, tu concesionaria de confianza en Mar del Plata. Más de 20 años vendiendo autos usados de calidad con garantía.',
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Sobre Nosotros</h1>
          <p className={styles.heroSubtitle}>
            Tu concesionaria de confianza en Mar del Plata desde hace más de 20 años
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.storyGrid}>
            <div className={styles.storyContent}>
              <h2 className={styles.sectionTitle}>Nuestra Historia</h2>
              <p className={styles.text}>
                Boston Automotores nació en el corazón de Mar del Plata con una misión clara:
                ofrecer vehículos usados de calidad a precios justos, respaldados por un servicio
                excepcional y honesto.
              </p>
              <p className={styles.text}>
                A lo largo de más de dos décadas, hemos ayudado a miles de familias a encontrar
                el auto perfecto para sus necesidades. Lo que comenzó como un pequeño emprendimiento
                familiar, hoy es una de las concesionarias más reconocidas de la zona.
              </p>
              <p className={styles.text}>
                Nuestro compromiso con la transparencia y la satisfacción del cliente nos ha permitido
                construir relaciones duraderas y generar recomendaciones que son nuestro mayor orgullo.
              </p>
            </div>
            <div className={styles.storyImage}>
              <div className={styles.imagePlaceholder}>
                <Car size={64} />
                <span>Boston Automotores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Nuestros Valores</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <ThumbsUp size={28} />
              </div>
              <h3 className={styles.valueTitle}>Honestidad</h3>
              <p className={styles.valueText}>
                Cada vehículo es verificado exhaustivamente. Te informamos todo sobre el auto,
                sin sorpresas ni letra chica.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Award size={28} />
              </div>
              <h3 className={styles.valueTitle}>Calidad</h3>
              <p className={styles.valueText}>
                Solo ofrecemos vehículos que cumplen con nuestros estándares de calidad.
                Tu seguridad es nuestra prioridad.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <Users size={28} />
              </div>
              <h3 className={styles.valueTitle}>Atención Personal</h3>
              <p className={styles.valueText}>
                Te acompañamos en cada paso del proceso. Desde la elección hasta el
                financiamiento y la post-venta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>¿Qué Ofrecemos?</h2>
          <div className={styles.offerGrid}>
            <div className={styles.offerItem}>
              <Car size={24} className={styles.offerIcon} />
              <h3 className={styles.offerTitle}>Autos Usados Verificados</h3>
              <p className={styles.offerText}>
                Amplio stock de vehículos usados inspectedos y listos para circular.
              </p>
            </div>
            <div className={styles.offerItem}>
              <Award size={24} className={styles.offerIcon} />
              <h3 className={styles.offerTitle}>Garantía Mecánica</h3>
              <p className={styles.offerText}>
                Todos nuestros vehículos incluyen garantía mecánica para tu tranquilidad.
              </p>
            </div>
            <div className={styles.offerItem}>
              <Users size={24} className={styles.offerIcon} />
              <h3 className={styles.offerTitle}>Financiación Flexible</h3>
              <p className={styles.offerText}>
                Planes de financiación adaptados a tu presupuesto y necesidades.
              </p>
            </div>
            <div className={styles.offerItem}>
              <ThumbsUp size={24} className={styles.offerIcon} />
              <h3 className={styles.offerTitle}>Aceptamos tu Usado</h3>
              <p className={styles.offerText}>
                Te recibimos tu usado como parte de pago con la mejor tasación del mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className={`${styles.section} ${styles.sectionPrimary}`}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} ${styles.sectionTitleLight}`}>
            ¿Por Qué Elegirnos?
          </h2>
          <div className={styles.trustGrid}>
            <div className={styles.trustStat}>
              <span className={styles.trustNumber}>500+</span>
              <span className={styles.trustLabel}>Autos vendidos</span>
            </div>
            <div className={styles.trustStat}>
              <span className={styles.trustNumber}>20+</span>
              <span className={styles.trustLabel}>Años de experiencia</span>
            </div>
            <div className={styles.trustStat}>
              <span className={styles.trustNumber}>100%</span>
              <span className={styles.trustLabel}>Clientes satisfechos</span>
            </div>
            <div className={styles.trustStat}>
              <span className={styles.trustNumber}>15</span>
              <span className={styles.trustLabel}>Marcas disponibles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Contactanos</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <MapPin size={24} className={styles.contactIcon} />
              <h3 className={styles.contactTitle}>Dirección</h3>
              <p className={styles.contactText}>Av. Colón 4469, Mar del Plata</p>
            </div>
            <div className={styles.contactCard}>
              <Phone size={24} className={styles.contactIcon} />
              <h3 className={styles.contactTitle}>Teléfono</h3>
              <a href="tel:+5492236329761" className={styles.contactLink}>+54 9 223 632-9761</a>
            </div>
            <div className={styles.contactCard}>
              <Mail size={24} className={styles.contactIcon} />
              <h3 className={styles.contactTitle}>Email</h3>
              <a href="mailto:bostonautomotores@hotmail.com" className={styles.contactLink}>
                bostonautomotores@hotmail.com
              </a>
            </div>
            <div className={styles.contactCard}>
              <Clock size={24} className={styles.contactIcon} />
              <h3 className={styles.contactTitle}>Horarios</h3>
              <p className={styles.contactText}>
                Lunes a Viernes: 9:00 - 18:00<br />
                Sábados: 9:00 - 13:00
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
