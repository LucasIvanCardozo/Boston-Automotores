'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Phone, Mail } from 'lucide-react';
import ContactForm from '@/components/forms/ContactForm/ContactForm';
import styles from './ContactSection.module.css';

const highlights = [
  {
    icon: <MessageSquare size={24} />,
    title: 'Respondemos rápido',
    text: 'En menos de 24 horas te contactamos.',
  },
  {
    icon: <Phone size={24} />,
    title: 'Atención personalizada',
    text: 'Un asesor dedicado para ayudarte.',
  },
  {
    icon: <Mail size={24} />,
    title: 'Sin compromiso',
    text: 'Consultá libremente, sin presión.',
  },
];

export default function ContactSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.title}>¿Tenés alguna consulta?</h2>
          <p className={styles.subtitle}>
            Completá el formulario y nuestro equipo te responde a la brevedad.
          </p>
        </motion.div>

        <div className={styles.content}>
          {/* Left: highlights */}
          <motion.div
            className={styles.highlights}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {highlights.map((item) => (
              <div key={item.title} className={styles.highlight}>
                <div className={styles.highlightIcon}>{item.icon}</div>
                <div>
                  <h4 className={styles.highlightTitle}>{item.title}</h4>
                  <p className={styles.highlightText}>{item.text}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Right: form */}
          <motion.div
            className={styles.formWrapper}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ContactForm sourcePage="/" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
