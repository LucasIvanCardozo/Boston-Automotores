'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { deleteAsset } from '@/lib/cloudinary';

export interface ImageData {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  order: number;
}

export interface ImageResult {
  success: boolean;
  error?: string;
  image?: Awaited<ReturnType<typeof prisma.image.findUnique>>;
}

/**
 * Add an image to a car
 */
export async function addImage(
  carId: string,
  imageData: ImageData
): Promise<ImageResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Verify car exists
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return { success: false, error: 'Vehículo no encontrado' };
    }

    // Create image record
    const image = await prisma.image.create({
      data: {
        carId,
        publicId: imageData.publicId,
        url: imageData.url,
        secureUrl: imageData.secureUrl,
        width: imageData.width,
        height: imageData.height,
        format: imageData.format,
        order: imageData.order,
      },
    });

    revalidatePath('/admin/autos');
    revalidatePath('/admin/autos/nuevo');
    revalidatePath(`/admin/autos/${carId}/editar`);

    return { success: true, image };
  } catch (error) {
    console.error('Error adding image:', error);
    return { success: false, error: 'Error al agregar la imagen' };
  }
}

/**
 * Delete an image
 */
export async function deleteImage(imageId: string): Promise<ImageResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Get image to delete cloudinary asset
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: { car: true },
    });

    if (!image) {
      return { success: false, error: 'Imagen no encontrada' };
    }

    // Delete from cloudinary
    try {
      await deleteAsset(image.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if cloudinary fails
    }

    // Delete from database
    await prisma.image.delete({
      where: { id: imageId },
    });

    revalidatePath('/admin/autos');
    revalidatePath(`/admin/autos/${image.carId}/editar`);

    return { success: true, image };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: 'Error al eliminar la imagen' };
  }
}

/**
 * Reorder images for a car
 */
export async function reorderImages(
  carId: string,
  imageOrders: { id: string; order: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Update all images with new orders
    await Promise.all(
      imageOrders.map(({ id, order }) =>
        prisma.image.update({
          where: { id },
          data: { order },
        })
      )
    );

    revalidatePath('/admin/autos');
    revalidatePath(`/admin/autos/${carId}/editar`);

    return { success: true };
  } catch (error) {
    console.error('Error reordering images:', error);
    return { success: false, error: 'Error al reordenar las imágenes' };
  }
}

/**
 * Get images for a car
 */
export async function getCarImages(carId: string): Promise<{
  success: boolean;
  error?: string;
  images?: Awaited<ReturnType<typeof prisma.image.findMany>>;
}> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const images = await prisma.image.findMany({
      where: { carId },
      orderBy: { order: 'asc' },
    });

    return { success: true, images };
  } catch (error) {
    console.error('Error getting images:', error);
    return { success: false, error: 'Error al obtener las imágenes' };
  }
}
