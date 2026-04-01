'use client';

import { useState, useCallback } from 'react';
import { getImageUploadParams } from '@/app/actions/images';
import styles from './ImageUploader.module.css';

export interface ImageData {
  id?: string;
  publicId: string;
  url: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  order: number;
  format?: string;
}

export interface StagedImage {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  order: number;
  previewUrl: string;
}

interface ImageUploaderProps {
  carId: string;
  initialImages?: ImageData[];
  onImagesChange?: (images: ImageData[]) => void;
  onStagedChange?: (staged: StagedImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  carId,
  initialImages = [],
  onImagesChange,
  onStagedChange,
  maxImages = 20,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [staged, setStaged] = useState<StagedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + staged.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const newStaged: StagedImage[] = [];
    let completed = 0;

    for (const file of Array.from(files)) {
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
      const MAX_SIZE = 10 * 1024 * 1024;

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`"${file.name}" no es un formato válido. Solo JPG, PNG o WebP.`);
        setIsUploading(false);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" supera los 10MB.`);
        setIsUploading(false);
        return;
      }

      const order = images.length + staged.length + newStaged.length;

      try {
        // Get signed upload params from server
        const paramsResult = await getImageUploadParams(carId, order);
        if (!paramsResult.success || !paramsResult.params) {
          throw new Error(paramsResult.error || 'Error al obtener parámetros de subida');
        }

        const { signature, timestamp, apiKey, cloudName, folder, publicId, transformation } = paramsResult.params;

        // Upload directly to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', String(timestamp));
        formData.append('api_key', apiKey);
        formData.append('folder', folder);
        formData.append('public_id', publicId);
        formData.append('transformation', transformation);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error?.message || `Error HTTP ${response.status}`);
        }

        const result = await response.json();

        const previewUrl = URL.createObjectURL(file);
        newStaged.push({
          publicId: result.public_id,
          url: result.secure_url,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          order,
          previewUrl,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al subir imagen');
        // Revoke already created previews
        newStaged.forEach(s => URL.revokeObjectURL(s.previewUrl));
        setIsUploading(false);
        return;
      }

      completed++;
      setUploadProgress(Math.round((completed / files.length) * 100));
    }

    const updated = [...staged, ...newStaged].map((img, idx) => ({ ...img, order: idx }));
    setStaged(updated);
    onStagedChange?.(updated);
    setIsUploading(false);
  }, [carId, images, staged, maxImages, onStagedChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDelete = useCallback((type: 'existing' | 'staged', index: number) => {
    if (type === 'staged') {
      const toDelete = staged[index];
      if (toDelete) URL.revokeObjectURL(toDelete.previewUrl);
      const newStaged = staged.filter((_, i) => i !== index);
      const reordered = newStaged.map((img, idx) => ({ ...img, order: idx }));
      setStaged(reordered);
      onStagedChange?.(reordered);
    } else {
      const newImages = images.filter((_, i) => i !== index);
      const reorderedImages = newImages.map((img, idx) => ({ ...img, order: idx }));
      setImages(reorderedImages);
      onImagesChange?.(reorderedImages);
    }
  }, [images, staged, onImagesChange, onStagedChange]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, type: 'existing' | 'staged', index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const draggedType = draggedIndex < images.length ? 'existing' : 'staged';
    const draggedIdx = draggedIndex < images.length ? draggedIndex : draggedIndex - images.length;

    if (draggedType === type && draggedIdx === index) return;

    if (draggedType === 'existing' && type === 'staged') {
      const moved = images[draggedIdx];
      const newExisting = images.filter((_, i) => i !== draggedIdx);
      const newStagedArr = [...staged];
      newStagedArr.splice(index, 0, {
        publicId: moved.publicId,
        url: moved.url,
        secureUrl: moved.secureUrl || moved.url,
        width: moved.width || 0,
        height: moved.height || 0,
        format: moved.format || '',
        order: index,
        previewUrl: moved.url,
      });
      setImages(newExisting.map((img, i) => ({ ...img, order: i })));
      setStaged(newStagedArr.map((img, i) => ({ ...img, order: images.length + i })));
    } else if (draggedType === 'staged' && type === 'existing') {
      const moved = staged[draggedIdx];
      const newStagedArr = staged.filter((_, i) => i !== draggedIdx);
      const newExistingArr = [...images];
      newExistingArr.splice(index, 0, {
        publicId: moved.publicId,
        url: moved.url,
        secureUrl: moved.secureUrl,
        width: moved.width,
        height: moved.height,
        format: moved.format,
        order: index,
      });
      setImages(newExistingArr.map((img, i) => ({ ...img, order: i })));
      setStaged(newStagedArr.map((img, i) => ({ ...img, order: images.length + i })));
    } else if (draggedType === type) {
      if (type === 'existing') {
        const newImages = [...images];
        const [moved] = newImages.splice(draggedIdx, 1);
        newImages.splice(index, 0, moved);
        setImages(newImages.map((img, i) => ({ ...img, order: i })));
      } else {
        const newStagedArr = [...staged];
        const [moved] = newStagedArr.splice(draggedIdx, 1);
        newStagedArr.splice(index, 0, moved);
        setStaged(newStagedArr.map((img, i) => ({ ...img, order: i })));
      }
    }

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
          disabled={isUploading || images.length + staged.length >= maxImages}
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

      {(images.length > 0 || staged.length > 0) && (
        <div className={styles.previews}>
          <p className={styles.count}>
            {images.length + staged.length} / {maxImages} imágenes
          </p>
          <div className={styles.grid}>
            {images.map((image, index) => (
              <div
                key={image.id || image.publicId || index}
                className={`${styles.previewItem} ${draggedIndex === index ? styles.dragging : ''}`}
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => handleDragOver(e, 'existing', index)}
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
                  onClick={() => handleDelete('existing', index)}
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            ))}
            {staged.map((image, index) => (
              <div
                key={`staged-${index}`}
                className={`${styles.previewItem} ${styles.stagedItem} ${draggedIndex === images.length + index ? styles.dragging : ''}`}
                draggable
                onDragStart={() => setDraggedIndex(images.length + index)}
                onDragOver={(e) => handleDragOver(e, 'staged', index)}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={image.previewUrl}
                  alt={`Nueva imagen ${index + 1}`}
                  className={styles.previewImage}
                />
                <span className={styles.orderBadge}>{images.length + index + 1}</span>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDelete('staged', index)}
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
                <span className={styles.pendingBadge}>Pendiente</span>
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
