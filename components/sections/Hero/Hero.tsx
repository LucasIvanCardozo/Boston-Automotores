'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Car } from 'lucide-react'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.backgroundWrapper}>
        <Image
          src="/assets/default.jpg"
          alt="Boston Automotores - Concesionaria de autos"
          fill
          loading="eager"
          priority
          className={styles.backgroundImage}
          sizes="100vw"
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={styles.textContent}
        >
          <h1 className={styles.title}>Tu próximo auto te está esperando</h1>
          <p className={styles.subtitle}>Más de 20 años vendiendo autos usados de calidad en Mar del Plata. Financiación disponible y garantía incluida.</p>

          <div className={styles.ctaGroup}>
            <Link href="/catalogo" className={styles.primaryButton}>
              <Car size={20} />
              Ver Catálogo
            </Link>
            <Link href="/vende-tu-auto" className={styles.secondaryButton}>
              Vende tu Auto
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className={styles.trustBadges}>
            <div className={styles.badge}>
              <span className={styles.badgeNumber}>20+</span>
              <span className={styles.badgeLabel}>Años de experiencia</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeNumber}>500+</span>
              <span className={styles.badgeLabel}>Autos vendidos</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeNumber}>100%</span>
              <span className={styles.badgeLabel}>Garantía</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
