'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    secureUrl: string;
    width?: number | null;
    height?: number | null;
  }>;
  carName: string;
}

export default function ImageGallery({ images, carName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const primaryImage = images[selectedIndex]?.secureUrl || images[selectedIndex]?.url || '/assets/default.jpg';

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const openLightbox = () => setIsLightboxOpen(true);
  const closeLightbox = () => setIsLightboxOpen(false);

  if (!images || images.length === 0) {
    return (
      <div className={styles.placeholder}>
        <Image
          src="/assets/default.jpg"
          alt={carName}
          fill
          className={styles.placeholderImage}
        />
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div className={styles.mainWrapper}>
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={styles.mainImage}
        >
          <Image
            src={primaryImage}
            alt={`${carName} - Imagen ${selectedIndex + 1}`}
            fill
            priority={selectedIndex === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
            className={styles.image}
          />
        </motion.div>

        {images.length > 1 && (
          <>
            <button
              className={`${styles.navButton} ${styles.navPrev}`}
              onClick={goToPrevious}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${styles.navButton} ${styles.navNext}`}
              onClick={goToNext}
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <button
          className={styles.zoomButton}
          onClick={openLightbox}
          aria-label="Ampliar imagen"
        >
          <ZoomIn size={20} />
        </button>

        <div className={styles.counter}>
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`${styles.thumbnail} ${index === selectedIndex ? styles.thumbnailActive : ''}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <Image
                src={image.secureUrl || image.url}
                alt={`${carName} - Miniatura ${index + 1}`}
                fill
                sizes="100px"
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              className={styles.lightboxClose}
              onClick={closeLightbox}
              aria-label="Cerrar visor"
            >
              <X size={28} />
            </button>

            <motion.div
              className={styles.lightboxContent}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={primaryImage}
                alt={`${carName} - Imagen ${selectedIndex + 1}`}
                fill
                sizes="100vw"
                className={styles.lightboxImage}
              />
            </motion.div>

            {images.length > 1 && (
              <>
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
