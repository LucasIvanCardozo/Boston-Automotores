'use client'

import { motion } from 'framer-motion'
import { Car, DollarSign, Repeat, HandshakeIcon, Banknote, Percent, CreditCard, FileCheck } from 'lucide-react'
import styles from './Services.module.css'

const mainServices = [
  {
    icon: Car,
    title: 'Venta',
    description: 'Amplia variedad de autos usados seleccionados. Todos nuestros vehículos cuentan con garantía y revisión mecánica completa.',
  },
  {
    icon: DollarSign,
    title: 'Compra',
    description: 'Compramos tu auto al mejor precio del mercado. Evaluación gratuita y pago inmediato.',
  },
  {
    icon: Repeat,
    title: 'Permuta',
    description: 'Cambiá tu auto por uno de nuestros vehículos. Evaluamos tu usado y te damos el mejor valor.',
  },
  {
    icon: HandshakeIcon,
    title: 'Consignación',
    description: 'Dejá tu auto en consignación y nosotros nos encargamos de venderlo. Sin preocupaciones para vos.',
  },
]

const financingFeatures = [
  {
    icon: Banknote,
    title: 'Tasa Fija en Pesos',
    description: 'Sin sorpresas ni aumentos. La cuota que pactás es la que pagás durante toda la financiación.',
  },
  {
    icon: CreditCard,
    title: 'Solo con DNI',
    description: 'Sin papeleos complicados. Con tu documento alcanza para acceder a la financiación.',
  },
  {
    icon: Percent,
    title: 'Mejor Tasa del Mercado',
    description: 'Trabajamos con los principales bancos para ofrecerte la mejor financiación disponible.',
  },
  {
    icon: FileCheck,
    title: 'Aprobación Rápida',
    description: 'Respuesta en minutos. Sin vueltas ni demoras innecesarias.',
  },
]

export default function Services() {
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
          <h2 className={styles.title}>Nuestros Servicios</h2>
          <p className={styles.subtitle}>Todo lo que necesitás para tu próximo auto en un solo lugar</p>
        </motion.div>

        <div className={styles.mainServicesGrid}>
          {mainServices.map((service, index) => (
            <motion.div
              key={service.title}
              className={styles.serviceCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className={styles.iconWrapper}>
                <service.icon size={32} className={styles.icon} />
              </div>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className={styles.financingSection}
        >
          <div className={styles.financingHeader}>
            <h3 className={styles.financingTitle}>Financiación Bancaria</h3>
            <p className={styles.financingSubtitle}>Accedé a tu auto con las mejores condiciones del mercado</p>
          </div>

          <div className={styles.financingGrid}>
            {financingFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={styles.financingCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <div className={styles.featureIcon}>
                  <feature.icon size={24} />
                </div>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureDescription}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
