import type { Metadata } from 'next';
import { Shield, Clock, DollarSign, Car, CheckCircle, Phone, MessageCircle } from 'lucide-react';
import SellCarForm from '@/components/forms/SellCarForm/SellCarForm';
import styles from './page.module.css';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bostonautomotores.com.ar';

export const metadata: Metadata = {
  title: 'Vendé tu Auto al Mejor Precio | Boston Automotores | Mar del Plata',
  description:
    'Vendé tu auto en Mar del Plata al mejor precio. Tasación gratuita, proceso rápido y pago inmediato. ¡Solicitá tu presupuesto hoy!',
  alternates: {
    canonical: `${baseUrl}/vende-tu-auto`,
  },
};

const benefits = [
  {
    icon: <DollarSign size={24} />,
    title: 'Mejor precio',
    description: 'Ofrecemos la mejor tasación del mercado por tu vehículo.',
  },
  {
    icon: <Clock size={24} />,
    title: 'Proceso rápido',
    description: 'Evaluamos tu auto y te damos una respuesta en menos de 24 horas.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Transacción segura',
    description: 'Pago inmediato y transferencia documentada para tu tranquilidad.',
  },
  {
    icon: <Car size={24} />,
    title: 'Tomamos tu usado',
    description: 'También aceptamos tu auto actual como parte de pago.',
  },
];

const processSteps = [
  {
    number: 1,
    title: 'Contactanos',
    description: 'Completá el formulario o llamanos para informarnos sobre tu vehículo.',
  },
  {
    number: 2,
    title: 'Evaluamos',
    description: 'Nuestro equipo evalúa tu vehículo y te ofrecemos la mejor tasación.',
  },
  {
    number: 3,
    title: 'Cerramos el trato',
    description: 'Si aceptás la oferta, hacemos la transferencia ese mismo día.',
  },
];

export default function SellCarPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo vendo mi auto?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simplemente completá el formulario de contacto, nuestro equipo evaluará tu vehículo y te haremos una oferta.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto tardan en pagar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El pago es inmediato una vez que aceptes la oferta. Realizamos la transferencia el mismo día.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Aceptan autos con deuda?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Evaluamos cada caso de forma individual. Contamos con opciones para vehículos con deuda prendaria.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo dejar mi auto en parte de pago?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, aceptamos permutas. Te recibirnos tu auto actual como parte de pago con la mejor tasación del mercado.',
        },
      },
    ],
  };

  return (
    <div className={styles.page}>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Vendé tu Auto</h1>
          <p className={styles.heroSubtitle}>
            Obtené la mejor tasación por tu vehículo. Proceso rápido, seguro y pago inmediato.
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>¿Por qué vendés con nosotros?</h2>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit) => (
              <div key={benefit.title} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>{benefit.icon}</div>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitDescription}>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
          <div className={styles.processGrid}>
            {processSteps.map((step) => (
              <div key={step.number} className={styles.processStep}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.formContent}>
              <h2 className={styles.sectionTitle}>Contactanos</h2>
              <p className={styles.formDescription}>
                Completá el formulario y nos pondremos en contacto con vos a la brevedad.
              </p>
              <SellCarForm sourcePage="/vende-tu-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className={`${styles.section} ${styles.sectionPrimary}`}>
        <div className={styles.container}>
          <div className={styles.trustSignals}>
            <div className={styles.trustItem}>
              <CheckCircle size={24} />
              <span>+500 autos comprados</span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle size={24} />
              <span>Pago inmediato</span>
            </div>
            <div className={styles.trustItem}>
              <CheckCircle size={24} />
              <span>20+ años de experiencia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Alternatives */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>También podés contactarnos directamente</h2>
          <div className={styles.contactAlternatives}>
            <a href="tel:+5492236329761" className={styles.contactButton}>
              <Phone size={20} />
              <span>Llamar ahora</span>
            </a>
            <a
              href="https://wa.me/5492236329761?text=Hola!%20Quiero%20vender%20mi%20auto"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.contactButton} ${styles.whatsappButton}`}
            >
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
