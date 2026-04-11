'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Instagram, Facebook, Phone, Mail } from 'lucide-react'
import styles from './Navigation.module.css'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/vende-tu-auto', label: 'Vende tu auto' },
]

const socialLinks = [
  { href: 'https://www.instagram.com/bostonautomotores/', label: 'Instagram', icon: Instagram },
  { href: 'https://www.facebook.com/www.bostonautomotores.com.ar/', label: 'Facebook', icon: Facebook },
]

const contactInfo = {
  phone: '+54 9 223 632-9761',
  email: 'bostonautomotoresmdp@gmail.com',
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      <button className={styles.menuButton} onClick={toggleMenu} aria-expanded={isOpen} aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Side Nav */}
      <div className={`${styles.sideNav} ${isOpen ? styles.sideNavOpen : ''}`}>
        <ul className={styles.navList}>
          {navLinks.map((link) => (
            <li key={link.href} className={styles.navItem}>
              <Link href={link.href} className={styles.navLink} onClick={closeMenu}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Contact Info for Mobile */}
        <div className={styles.mobileContact}>
          <div className={styles.contactItem}>
            <Phone size={18} className={styles.contactIcon} />
            <a href={`tel:${contactInfo.phone}`} className={styles.contactLink}>
              {contactInfo.phone}
            </a>
          </div>
          <div className={styles.contactItem}>
            <Mail size={18} className={styles.contactIcon} />
            <a href={`mailto:${contactInfo.email}`} className={styles.contactLink}>
              {contactInfo.email}
            </a>
          </div>
        </div>

        {/* Social Links for Mobile */}
        <div className={styles.mobileSocial}>
          <span className={styles.socialLabel}>Seguinos</span>
          <div className={styles.socialLinks}>
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={link.label}
                onClick={closeMenu}
              >
                <link.icon size={22} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={closeMenu} aria-hidden="true" />}
    </nav>
  )
}
