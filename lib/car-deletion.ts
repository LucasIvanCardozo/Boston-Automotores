import { prisma } from '@/lib/prisma';
import { deleteAsset, extractPublicIdFromUrl } from '@/lib/cloudinary';

interface DeleteResult {
  success: boolean;
  error?: string;
  deletedImages: number;
  deletedDocument: boolean;
}

/**
 * Hard delete a car and all its associated assets
 * This deletes:
 * - All images from Cloudinary
 * - Technical sheet PDF from Cloudinary (if exists)
 * - All database records (images, technical sheet, car)
 */
export async function hardDeleteCar(carId: string): Promise<DeleteResult> {
  const result: DeleteResult = {
    success: false,
    deletedImages: 0,
    deletedDocument: false,
  };

  try {
    // Get car with all related data
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        images: true,
        technicalSheet: true,
      },
    });

    if (!car) {
      return { ...result, error: 'Vehículo no encontrado' };
    }

    // Delete images from Cloudinary
    const cloudinaryErrors: string[] = [];
    
    for (const image of car.images) {
      try {
        const publicId = image.publicId || extractPublicIdFromUrl(image.url);
        if (publicId) {
          await deleteAsset(publicId);
          result.deletedImages++;
        }
      } catch (error) {
        console.error(`Error deleting image ${image.id} from Cloudinary:`, error);
        cloudinaryErrors.push(`Error al eliminar imagen: ${image.id}`);
      }
    }

    // Delete technical sheet from Cloudinary if exists
    if (car.technicalSheet?.publicId) {
      try {
        await deleteAsset(car.technicalSheet.publicId);
        result.deletedDocument = true;
      } catch (error) {
        console.error('Error deleting technical sheet from Cloudinary:', error);
        cloudinaryErrors.push('Error al eliminar ficha técnica');
      }
    }

    // Delete database records in correct order (due to foreign key constraints)
    await prisma.$transaction([
      // Delete images records
      prisma.image.deleteMany({
        where: { carId },
      }),
      
      // Delete technical sheet record if exists
      prisma.technicalSheet.deleteMany({
        where: { carId },
      }),
      
      // Finally delete the car
      prisma.car.delete({
        where: { id: carId },
      }),
    ]);

    result.success = true;

    // Log warnings if there were Cloudinary errors
    if (cloudinaryErrors.length > 0) {
      console.warn('Some Cloudinary assets could not be deleted:', cloudinaryErrors);
    }

    return result;
  } catch (error) {
    console.error('Error in hardDeleteCar:', error);
    return {
      ...result,
      error: error instanceof Error ? error.message : 'Error al eliminar el vehículo',
    };
  }
}
