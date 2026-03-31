'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { uploadDocument, deleteAsset } from '@/lib/cloudinary';

export interface DocumentResult {
  success: boolean;
  error?: string;
  document?: Awaited<ReturnType<typeof prisma.technicalSheet.findUnique>>;
}

/**
 * Upload a technical sheet for a car
 */
export async function uploadTechnicalSheet(
  carId: string,
  file: File
): Promise<DocumentResult> {
  if (!carId || typeof carId !== 'string' || carId.trim() === '') {
    return { success: false, error: 'ID de vehículo inválido o faltante' };
  }

  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  // Validate file type
  if (file.type !== 'application/pdf') {
    return { success: false, error: 'Solo se permiten archivos PDF' };
  }

  // Validate file size (20MB max)
  if (file.size > 20 * 1024 * 1024) {
    return { success: false, error: 'El archivo es demasiado grande. Máximo 20MB.' };
  }

  try {
    // Verify car exists
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return { success: false, error: 'Vehículo no encontrado' };
    }

    // Check if car already has a technical sheet
    const existingSheet = await prisma.technicalSheet.findUnique({
      where: { carId },
    });

    // Delete existing sheet from cloudinary if exists
    if (existingSheet) {
      try {
        await deleteAsset(existingSheet.publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with upload even if deletion fails
      }

      // Delete from database
      await prisma.technicalSheet.delete({
        where: { carId },
      });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await uploadDocument(dataUri, {
      folder: `client-boston/documents`,
      publicId: `${carId}/technical`,
    });

    // Create database record
    const technicalSheet = await prisma.technicalSheet.create({
      data: {
        carId,
        publicId: result.public_id,
        url: result.secure_url,
        filename: file.name,
      },
    });

    revalidatePath('/admin/autos');
    revalidatePath(`/admin/autos/${carId}/editar`);

    return { success: true, document: technicalSheet };
  } catch (error) {
    console.error('Error uploading technical sheet:', error);
    return { success: false, error: 'Error al subir la ficha técnica' };
  }
}

/**
 * Delete a technical sheet
 */
export async function deleteTechnicalSheet(carId: string): Promise<DocumentResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const sheet = await prisma.technicalSheet.findUnique({
      where: { carId },
    });

    if (!sheet) {
      return { success: false, error: 'Ficha técnica no encontrada' };
    }

    // Delete from cloudinary
    try {
      await deleteAsset(sheet.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if cloudinary fails
    }

    // Delete from database
    await prisma.technicalSheet.delete({
      where: { carId },
    });

    revalidatePath('/admin/autos');
    revalidatePath(`/admin/autos/${carId}/editar`);

    return { success: true, document: sheet };
  } catch (error) {
    console.error('Error deleting technical sheet:', error);
    return { success: false, error: 'Error al eliminar la ficha técnica' };
  }
}

/**
 * Get technical sheet for a car
 */
export async function getTechnicalSheet(carId: string): Promise<DocumentResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const sheet = await prisma.technicalSheet.findUnique({
      where: { carId },
    });

    if (!sheet) {
      return { success: false, error: 'Ficha técnica no encontrada' };
    }

    return { success: true, document: sheet };
  } catch (error) {
    console.error('Error getting technical sheet:', error);
    return { success: false, error: 'Error al obtener la ficha técnica' };
  }
}
