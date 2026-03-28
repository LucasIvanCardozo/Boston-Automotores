'use client';

import { useEffect, useRef } from 'react';

/**
 * Componente que mide el alto del Header y lo guarda en una variable CSS
 * Se actualiza automáticamente si el Header cambia de tamaño (resize, media queries, etc.)
 */
export default function HeaderHeightObserver() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Buscar el header por su atributo o clase
    headerRef.current = document.querySelector('header') || 
                        document.querySelector('[data-header]') ||
                        document.querySelector('nav');

    if (!headerRef.current) {
      // Si no hay header, usar un valor por defecto
      document.documentElement.style.setProperty('--header-height-measured', '64px');
      return;
    }

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height-measured', `${height}px`);
      }
    };

    // Medir inmediatamente
    updateHeaderHeight();

    // Usar ResizeObserver para detectar cambios de tamaño
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(headerRef.current);

    // También actualizar en resize de ventana (por si cambian media queries)
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // Este componente no renderiza nada visual
  return null;
}
