'use client'

import { motion } from 'framer-motion'
import { Camera, Heart, MessageCircle } from 'lucide-react'
import styles from './InstagramFeed.module.css'

// Instagram icon SVG inline (lucide-react Instagram is deprecated)
const InstagramIcon = ({ size = 64 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function InstagramFeed() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className={styles.content}
        >
          {/* Icono grande de Instagram */}
          <motion.div
            className={styles.iconWrapper}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <InstagramIcon size={64} />
          </motion.div>

          <h2 className={styles.title}>Seguinos en Instagram</h2>

          <p className={styles.subtitle}>
            Descubrí nuestros últimos ingresos, promociones exclusivas y todo lo que tenemos para ofrecerte. ¡Sé parte de nuestra comunidad!
          </p>

          {/* Stats decorativos */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <Camera size={20} />
              <span>Publicaciones diarias</span>
            </div>
            <div className={styles.statItem}>
              <Heart size={20} />
              <span>Ofertas exclusivas</span>
            </div>
            <div className={styles.statItem}>
              <MessageCircle size={20} />
              <span>Atención personalizada</span>
            </div>
          </div>

          <motion.a
            href="https://www.instagram.com/bostonautomotores"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <InstagramIcon size={24} />
            <span>@bostonautomotores</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
