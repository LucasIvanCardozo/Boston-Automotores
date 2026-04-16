import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react'
import styles from './Footer.module.css'

const contactInfo = {
  phone: '+54 9 223 632-9761',
  email: 'bostonautomotoresmdp@gmail.com',
  address: 'Av. Colón 4469, Mar del Plata',
  hours: 'Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 13:00',
}

const quickLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/vende-tu-auto', label: 'Vende tu auto' },
]

const socialLinks = [
  { href: 'https://www.instagram.com/bostonautomotoresmdp/', label: 'Instagram', icon: Instagram },
  { href: 'https://www.facebook.com/www.bostonautomotores.com.ar/', label: 'Facebook', icon: Facebook },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <h3 className={styles.brandName}>Boston Automotores</h3>
          <p className={styles.brandTagline}>Tu concesionaria de confianza en Mar del Plata desde hace más de 20 años.</p>
          <div className={styles.socialLinks}>
            {socialLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label={link.label}>
                <link.icon size={20} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linksSection}>
          <h4 className={styles.sectionTitle}>Enlaces</h4>
          <ul className={styles.linksList}>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className={styles.contactSection}>
          <h4 className={styles.sectionTitle}>Contacto</h4>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <Phone size={16} className={styles.contactIcon} />
              <a href={`tel:${contactInfo.phone}`} className={styles.contactLink}>
                {contactInfo.phone}
              </a>
            </li>
            <li className={styles.contactItem}>
              <Mail size={16} className={styles.contactIcon} />
              <a href={`mailto:${contactInfo.email}`} className={styles.contactLink}>
                {contactInfo.email}
              </a>
            </li>
            <li className={styles.contactItem}>
              <MapPin size={16} className={styles.contactIcon} />
              <span className={styles.contactText}>{contactInfo.address}</span>
            </li>
          </ul>
        </div>

        {/* Business Hours */}
        <div className={styles.hoursSection}>
          <h4 className={styles.sectionTitle}>Horarios</h4>
          <p className={styles.hoursText}>{contactInfo.hours}</p>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <p>© {new Date().getFullYear()} Boston Automotores. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
