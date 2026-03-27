'use client';

import { useState, useCallback } from 'react';
import { addImage } from '@/app/actions/images';
import styles from './ImageUploader.module.css';

export interface ImageData {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  order: number;
  format?: string;
}

interface ImageUploaderProps {
  carId: string;
  initialImages?: ImageData[];
  onImagesChange?: (images: ImageData[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  carId,
  initialImages = [],
  onImagesChange,
  maxImages = 20,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const uploadPromises = Array.from(files).map(async (file, index) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('carId', carId);
        formData.append('order', String(images.length + index));

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al subir imagen');
        }

        const data = await response.json();

        const imageData: ImageData = {
          publicId: data.publicId,
          url: data.url,
          secureUrl: data.url,
          width: data.width,
          height: data.height,
          format: data.format,
          order: images.length + index,
        };

        // Persist to database
        const addResult = await addImage(carId, imageData);
        if (!addResult.success) {
          throw new Error(addResult.error || 'Error al guardar la imagen');
        }

        return imageData;
      } catch (err) {
        throw err;
      }
    });

    try {
      const totalUploads = uploadPromises.length;
      let completedUploads = 0;

      const results: ImageData[] = [];
      for (const promise of uploadPromises) {
        const result = await promise;
        results.push(result);
        completedUploads++;
        setUploadProgress(Math.round((completedUploads / totalUploads) * 100));
      }

      const newImages = [...images, ...results].map((img, idx) => ({
        ...img,
        order: idx,
      }));

      setImages(newImages);
      onImagesChange?.(newImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imágenes');
    } finally {
      setIsUploading(false);
    }
  }, [carId, images, maxImages, onImagesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDelete = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      order: idx,
    }));
    setImages(reorderedImages);
    onImagesChange?.(reorderedImages);
  }, [images, onImagesChange]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onImagesChange?.(images);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          id="image-upload"
          className={styles.fileInput}
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={isUploading || images.length >= maxImages}
        />
        <label htmlFor="image-upload" className={styles.dropzoneLabel}>
          <span className={styles.uploadIcon}>📷</span>
          <span className={styles.uploadText}>
            {isUploading
              ? `Subiendo... ${uploadProgress}%`
              : 'Arrastra imágenes aquí o haz clic para seleccionar'}
          </span>
          <span className={styles.uploadHint}>
            JPG, PNG o WebP. Máximo 10MB por imagen.
          </span>
        </label>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.previews}>
          <p className={styles.count}>
            {images.length} / {maxImages} imágenes
          </p>
          <div className={styles.grid}>
            {images.map((image, index) => (
              <div
                key={image.publicId || index}
                className={`${styles.previewItem} ${draggedIndex === index ? styles.dragging : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={image.url}
                  alt={`Imagen ${index + 1}`}
                  className={styles.previewImage}
                />
                <span className={styles.orderBadge}>{index + 1}</span>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDelete(index)}
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className={styles.hint}>
            Arrastra las imágenes para reordenarlas
          </p>
        </div>
      )}
    </div>
  );
}
