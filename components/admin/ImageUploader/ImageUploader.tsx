'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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

// Internal unified item — tracks whether it came from DB or was just uploaded
interface UnifiedItem {
  // Shared
  publicId: string;
  url: string;
  // Existing-only
  id?: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  // Staged-only
  isStaged?: boolean;
  previewUrl?: string;
}

interface ImageUploaderProps {
  carId: string;
  initialImages?: ImageData[];
  onImagesChange?: (images: ImageData[]) => void;
  onStagedChange?: (staged: StagedImage[]) => void;
  maxImages?: number;
}

/**
 * Converts a flat unified list back to the two typed lists the parent expects.
 */
function splitList(items: UnifiedItem[]): {
  existing: ImageData[];
  staged: StagedImage[];
} {
  const existing: ImageData[] = [];
  const staged: StagedImage[] = [];

  items.forEach((item, idx) => {
    if (item.isStaged) {
      staged.push({
        publicId: item.publicId,
        url: item.url,
        secureUrl: item.secureUrl || item.url,
        width: item.width ?? 0,
        height: item.height ?? 0,
        format: item.format ?? '',
        order: idx,
        previewUrl: item.previewUrl!,
      });
    } else {
      existing.push({
        id: item.id,
        publicId: item.publicId,
        url: item.url,
        secureUrl: item.secureUrl,
        width: item.width,
        height: item.height,
        format: item.format,
        order: idx,
      });
    }
  });

  return { existing, staged };
}

export default function ImageUploader({
  carId,
  initialImages = [],
  onImagesChange,
  onStagedChange,
  maxImages = 20,
}: ImageUploaderProps) {
  // Single flat list — order is always the array index
  const [items, setItems] = useState<UnifiedItem[]>(() =>
    initialImages
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => ({
        id: img.id,
        publicId: img.publicId,
        url: img.url,
        secureUrl: img.secureUrl,
        width: img.width,
        height: img.height,
        format: img.format,
      }))
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Drag state lives in a ref — never causes re-renders during drag, avoids
  // stale-closure problems with dragOver firing 60fps.
  const dragIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Sync to parent after every items change — useEffect guarantees this runs
  // after the render is committed, never during render (avoids the
  // "setState on a different component while rendering" warning).
  useEffect(() => {
    const { existing, staged } = splitList(items);
    onImagesChange?.(existing);
    onStagedChange?.(staged);
    // onImagesChange / onStagedChange are stable refs from the parent (useCallback),
    // so including them here is safe and lint-correct.
  }, [items, onImagesChange, onStagedChange]);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      if (items.length + files.length > maxImages) {
        setError(`Máximo ${maxImages} imágenes permitidas`);
        return;
      }

      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      const newItems: UnifiedItem[] = [];
      let completed = 0;

      for (const file of Array.from(files)) {
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
        const MAX_SIZE = 10 * 1024 * 1024;

        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`"${file.name}" no es un formato válido. Solo JPG, PNG o WebP.`);
          newItems.forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
          setIsUploading(false);
          return;
        }
        if (file.size > MAX_SIZE) {
          setError(`"${file.name}" supera los 10MB.`);
          newItems.forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
          setIsUploading(false);
          return;
        }

        try {
          // publicId is a UUID — never the order. This prevents Cloudinary overwrites
          // when the user reorders images after uploading but before saving.
          const paramsResult = await getImageUploadParams(carId);
          if (!paramsResult.success || !paramsResult.params) {
            throw new Error(paramsResult.error || 'Error al obtener parámetros de subida');
          }

          const { signature, timestamp, apiKey, cloudName, folder, publicId, transformation } =
            paramsResult.params;

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

          newItems.push({
            publicId: result.public_id,
            url: result.secure_url,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            isStaged: true,
            previewUrl,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al subir imagen');
          newItems.forEach((s) => s.previewUrl && URL.revokeObjectURL(s.previewUrl));
          setIsUploading(false);
          return;
        }

        completed++;
        setUploadProgress(Math.round((completed / files.length) * 100));
      }

      setItems((prev) => [...prev, ...newItems]);
      setIsUploading(false);
    },
    [carId, items.length, maxImages]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDelete = useCallback((index: number) => {
    setItems((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleDragStart = useCallback((index: number) => {
    dragIndexRef.current = index;
    setDraggingIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = dragIndexRef.current;
    if (sourceIndex === null || sourceIndex === targetIndex) return;

    // Update the ref immediately (no re-render cost)
    dragIndexRef.current = targetIndex;

    // Update the visual list — this is fine because we only move one slot at a time
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggingIndex(targetIndex);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDraggingIndex(null);
    // No manual notifyParent needed — the useEffect above fires automatically
    // after every items state change, including the last dragOver update.
  }, []);

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
          disabled={isUploading || items.length >= maxImages}
        />
        <label htmlFor="image-upload" className={styles.dropzoneLabel}>
          <span className={styles.uploadIcon}>📷</span>
          <span className={styles.uploadText}>
            {isUploading
              ? `Subiendo... ${uploadProgress}%`
              : 'Arrastra imágenes aquí o haz clic para seleccionar'}
          </span>
          <span className={styles.uploadHint}>JPG, PNG o WebP. Máximo 10MB por imagen.</span>
        </label>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {items.length > 0 && (
        <div className={styles.previews}>
          <p className={styles.count}>
            {items.length} / {maxImages} imágenes
          </p>
          <div className={styles.grid}>
            {items.map((item, index) => (
              <div
                key={item.id ?? `staged-${item.publicId}`}
                className={`${styles.previewItem} ${item.isStaged ? styles.stagedItem : ''} ${draggingIndex === index ? styles.dragging : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <img
                  src={item.isStaged ? item.previewUrl : item.url}
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
                {item.isStaged && <span className={styles.pendingBadge}>Pendiente</span>}
              </div>
            ))}
          </div>
          <p className={styles.hint}>Arrastra las imágenes para reordenarlas</p>
        </div>
      )}
    </div>
  );
}
