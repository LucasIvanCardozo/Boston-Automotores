'use client';

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button/Button';
import styles from './TechnicalSheetUploader.module.css';

interface TechnicalSheetUploaderProps {
  carId: string;
  initialSheet?: {
    url: string;
    filename: string;
  };
  onUploadComplete?: (data: { publicId: string; url: string; filename: string }) => void;
  onDelete?: () => void;
}

export default function TechnicalSheetUploader({
  carId,
  initialSheet,
  onUploadComplete,
  onDelete,
}: TechnicalSheetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState(initialSheet || null);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const ALLOWED_TYPE = 'application/pdf';

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;

    if (file.type !== ALLOWED_TYPE) {
      setError('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo es demasiado grande. Máximo 20MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('carId', carId);
      formData.append('type', 'technical-sheet');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir el archivo');
      }

      const data = await response.json();

      const sheetData = {
        publicId: data.publicId,
        url: data.url,
        filename: file.name,
      };

      setUploadedFile({
        url: data.url,
        filename: file.name,
      });

      onUploadComplete?.(sheetData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la ficha técnica');
    } finally {
      setIsUploading(false);
    }
  }, [carId, onUploadComplete]);

  const handleDelete = useCallback(async () => {
    if (!uploadedFile) return;

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          type: 'technical-sheet',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar el archivo');
      }

      setUploadedFile(null);
      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la ficha técnica');
    }
  }, [carId, uploadedFile, onDelete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  if (uploadedFile) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.fileCard}>
          <div className={styles.fileIcon}>📄</div>
          <div className={styles.fileInfo}>
            <span className={styles.filename}>{uploadedFile.filename}</span>
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewLink}
            >
              Ver archivo
            </a>
          </div>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading}
          >
            Eliminar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.dropzone}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          id="technical-sheet-upload"
          className={styles.fileInput}
          accept=".pdf,application/pdf"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          disabled={isUploading}
        />
        <label htmlFor="technical-sheet-upload" className={styles.dropzoneLabel}>
          <span className={styles.uploadIcon}>📄</span>
          <span className={styles.uploadText}>
            {isUploading
              ? 'Subiendo...'
              : 'Arrastra la ficha técnica aquí o haz clic para seleccionar'}
          </span>
          <span className={styles.uploadHint}>
            Solo PDF. Máximo 20MB.
          </span>
        </label>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}
