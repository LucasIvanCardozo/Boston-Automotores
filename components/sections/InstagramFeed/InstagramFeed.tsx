'use client';

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import styles from './InstagramFeed.module.css';

const placeholderPosts = [
  { id: 1, title: 'Ford Territory', color: '#1a1a1a' },
  { id: 2, title: 'Chevrolet Tracker', color: '#2d5a9e' },
  { id: 3, title: 'VW Amarok', color: '#3d3d3d' },
  { id: 4, title: 'Toyota Corolla', color: '#8b0000' },
  { id: 5, title: 'Jeep Compass', color: '#1a3d1a' },
  { id: 6, title: 'Peugeot 208', color: '#4a4a4a' },
];

export default function InstagramFeed() {
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
          <h2 className={styles.title}>Seguinos en Instagram</h2>
          <p className={styles.subtitle}>
            Mirá nuestros últimos ingresos y novedades
          </p>
          <a
            href="https://instagram.com/bostonautomotores"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramLink}
          >
            <Instagram size={20} />
            @bostonautomotores
          </a>
        </motion.div>

        <div className={styles.grid}>
          {placeholderPosts.map((post, index) => (
            <motion.a
              key={post.id}
              href="https://instagram.com/bostonautomotores"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.post}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div
                className={styles.postImage}
                style={{ backgroundColor: post.color }}
              >
                <Instagram size={32} className={styles.placeholderIcon} />
              </div>
              <div className={styles.postOverlay}>
                <Instagram size={24} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
