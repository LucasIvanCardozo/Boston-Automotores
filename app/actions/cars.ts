'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { carCreateSchema, carUpdateSchema, carDeleteSchema, toggleFeaturedSchema, carSpecsSchema } from '@/lib/schemas/car';
import type { CarCreateInput, CarUpdateInput, CarSpecs } from '@/lib/schemas/car';
import { requireAuth } from '@/lib/auth';
import { hardDeleteCar } from '@/lib/car-deletion';
import { deleteAsset, extractPublicIdFromUrl } from '@/lib/cloudinary';

export interface CarResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

export interface CarListResult {
  success: boolean;
  error?: string;
  cars?: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number; // Serialized from Decimal
    mileage: number;
    fuelType: 'nafta' | 'diesel' | 'electrico' | 'hibrido' | 'gnc';
    transmission: 'manual' | 'automatica' | 'cvt';
    status: 'available' | 'sold' | 'reserved';
    featured: boolean;
    description: string | null;
    features: string[];
    specs: CarSpecs | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    images: Array<{
      id: string;
      url: string;
      secureUrl: string;
    }>;
  }>;
  total?: number;
}

/**
 * Parse specs from FormData (handles both JSON string and individual fields)
 */
function parseSpecsFromFormData(formData: FormData): CarSpecs | undefined {
  const specsStr = formData.get('specs');
  
  if (specsStr && typeof specsStr === 'string') {
    try {
      const parsed = JSON.parse(specsStr);
      const validation = carSpecsSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data;
      }
    } catch {
      // If parsing fails, try to build from individual fields
    }
  }
  
  // Fallback: build specs from individual fields
  const sensors = formData.getAll('specs.sensors');
  const securityFeatures = formData.getAll('specs.securityFeatures');
  const comfortFeatures = formData.getAll('specs.comfortFeatures');
  
  const specs: Partial<CarSpecs> = {};
  
  const engine = formData.get('specs.engine');
  if (engine) specs.engine = engine as string;
  
  const steering = formData.get('specs.steering');
  if (steering) specs.steering = steering as CarSpecs['steering'];
  
  const color = formData.get('specs.color');
  if (color) specs.color = color as string;
  
  const doors = formData.get('specs.doors');
  if (doors) specs.doors = parseInt(doors as string, 10);
  
  const wheels = formData.get('specs.wheels');
  if (wheels) specs.wheels = wheels as string;
  
  const wheelSize = formData.get('specs.wheelSize');
  if (wheelSize) specs.wheelSize = wheelSize as string;
  
  const audioSystem = formData.get('specs.audioSystem');
  if (audioSystem) specs.audioSystem = audioSystem as string;
  
  const headlights = formData.get('specs.headlights');
  if (headlights) specs.headlights = headlights as CarSpecs['headlights'];
  
  if (sensors.length > 0) specs.sensors = sensors as string[];
  if (securityFeatures.length > 0) specs.securityFeatures = securityFeatures as string[];
  if (comfortFeatures.length > 0) specs.comfortFeatures = comfortFeatures as string[];
  
  const validation = carSpecsSchema.safeParse(specs);
  return validation.success ? validation.data : undefined;
}

/**
 * Create a new car
 */
export async function createCar(formData: FormData): Promise<CarResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const rawData: CarCreateInput = {
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    year: parseInt(formData.get('year') as string, 10) || new Date().getFullYear(),
    price: parseInt(formData.get('price') as string, 10) || 0,
    mileage: parseInt(formData.get('mileage') as string, 10) || 0,
    fuelType: (formData.get('fuelType') as CarCreateInput['fuelType']) || 'nafta',
    transmission: (formData.get('transmission') as CarCreateInput['transmission']) || 'manual',
    status: (formData.get('status') as CarCreateInput['status']) || 'available',
    featured: formData.get('featured') === 'true',
    description: (formData.get('description') as string) || undefined,
    features: formData.get('features')
      ? (JSON.parse(formData.get('features') as string) as string[])
      : [],
  };

  // Parse specs from formData
  const specs = parseSpecsFromFormData(formData);
  if (specs) {
    rawData.specs = specs;
  }

  const validation = carCreateSchema.safeParse(rawData);
  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message;
    return { success: false, error: firstError || 'Datos inválidos' };
  }

  try {
    const car = await prisma.car.create({
      data: validation.data,
    });

    revalidatePath('/admin/autos');
    revalidatePath('/admin/autos/nuevo');
    revalidatePath('/catalogo');

    // Convert Decimal to Number for serialization
    return { 
      success: true, 
      data: {
        ...car,
        price: Number(car.price),
      }
    };
  } catch (error) {
    console.error('Error creating car:', error);
    return { success: false, error: 'Error al crear el vehículo' };
  }
}

/**
 * Update an existing car
 */
export async function updateCar(id: string, formData: FormData): Promise<CarResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const validationId = carDeleteSchema.shape.id.safeParse(id);
  if (!validationId.success) {
    return { success: false, error: 'ID de vehículo inválido' };
  }

  // Build raw data object for partial update - all fields optional
  type CarUpdateFormData = {
    brand?: string;
    model?: string;
    year?: number;
    price?: number;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    status?: string;
    featured?: boolean;
    description?: string;
    features?: string[];
    specs?: CarSpecs;
  };
  const rawData: CarUpdateFormData = {
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    year: formData.get('year') ? parseInt(formData.get('year') as string, 10) : undefined,
    price: formData.get('price') !== null && formData.get('price') !== ''
      ? parseInt(formData.get('price') as string, 10)
      : undefined,
    mileage: formData.get('mileage') ? parseInt(formData.get('mileage') as string, 10) : undefined,
    fuelType: formData.get('fuelType') as string,
    transmission: formData.get('transmission') as string,
    status: formData.get('status') as string || undefined,
    featured: formData.get('featured') === 'true' ? true : formData.get('featured') === 'false' ? false : undefined,
    description: formData.get('description') as string || undefined,
    features: formData.get('features')
      ? (JSON.parse(formData.get('features') as string) as string[])
      : undefined,
  };

  // Parse specs from formData
  const specs = parseSpecsFromFormData(formData);
  if (specs) {
    rawData.specs = specs;
  }

  const validation = carUpdateSchema.safeParse(rawData);
  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message;
    return { success: false, error: firstError || 'Datos inválidos' };
  }

  try {
    const car = await prisma.car.update({
      where: { id },
      data: validation.data,
    });

    // Process deleted images (staged deletions from the edit form)
    const deletedImageIdsRaw = formData.get('deletedImageIds');
    if (deletedImageIdsRaw) {
      const deletedImageIds = JSON.parse(deletedImageIdsRaw as string) as string[];

      // Fetch images to get their Cloudinary public IDs
      const imagesToDelete = await prisma.image.findMany({
        where: { id: { in: deletedImageIds }, carId: id },
      });

      // Delete from Cloudinary
      for (const image of imagesToDelete) {
        try {
          const publicId = image.publicId || extractPublicIdFromUrl(image.url);
          if (publicId) {
            await deleteAsset(publicId);
          }
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary during update:', cloudinaryError);
        }
      }

      // Delete from database
      await prisma.image.deleteMany({
        where: { id: { in: deletedImageIds }, carId: id },
      });
    }

    // Process staged (new) images — already uploaded to Cloudinary, just save to DB
    const stagedImagesRaw = formData.get('stagedImages');
    if (stagedImagesRaw) {
      const stagedImages = JSON.parse(stagedImagesRaw as string) as Array<{
        publicId: string;
        url: string;
        secureUrl: string;
        width: number;
        height: number;
        format: string;
        order: number;
      }>;

      for (const staged of stagedImages) {
        try {
          await prisma.image.create({
            data: {
              carId: id,
              publicId: staged.publicId,
              url: staged.url,
              secureUrl: staged.secureUrl,
              width: staged.width,
              height: staged.height,
              format: staged.format,
              order: staged.order,
            },
          });
        } catch (saveError) {
          console.error('Error saving staged image to DB:', saveError);
        }
      }
    }

    // Process reordered images — update their order in the database
    const reorderedImagesRaw = formData.get('reorderedImages');
    if (reorderedImagesRaw) {
      const reorderedImages = JSON.parse(reorderedImagesRaw as string) as Array<{
        id: string;
        order: number;
      }>;

      for (const reorder of reorderedImages) {
        try {
          await prisma.image.update({
            where: { id: reorder.id, carId: id },
            data: { order: reorder.order },
          });
        } catch (reorderError) {
          console.error('Error updating image order:', reorderError);
        }
      }
    }

    revalidatePath('/admin/autos');
    revalidatePath(`/admin/autos/${id}/editar`);
    revalidatePath('/catalogo');
    revalidatePath(`/catalogo/${id}`);

    // Don't return car data - contains Decimal fields that can't serialize to client
    return { success: true };
  } catch (error) {
    console.error('Error updating car:', error);
    return { success: false, error: 'Error al actualizar el vehículo' };
  }
}

/**
 * Delete a car (hard delete)
 * This permanently deletes the car and all associated assets (images, PDF)
 */
export async function deleteCar(id: string): Promise<CarResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const validation = carDeleteSchema.shape.id.safeParse(id);
  if (!validation.success) {
    return { success: false, error: 'ID de vehículo inválido' };
  }

  try {
    // Use hard delete service
    const deleteResult = await hardDeleteCar(id);

    if (!deleteResult.success) {
      return { 
        success: false, 
        error: deleteResult.error || 'Error al eliminar el vehículo' 
      };
    }

    revalidatePath('/admin/autos');
    revalidatePath('/catalogo');

    return { success: true };
  } catch (error) {
    console.error('Error deleting car:', error);
    return { success: false, error: 'Error al eliminar el vehículo' };
  }
}

/**
 * Toggle featured status
 */
export async function toggleFeatured(id: string, featured: boolean): Promise<CarResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const validation = toggleFeaturedSchema.shape.id.safeParse(id);
  if (!validation.success) {
    return { success: false, error: 'ID de vehículo inválido' };
  }

  try {
    const car = await prisma.car.update({
      where: { id },
      data: { featured },
    });

    revalidatePath('/admin/autos');
    revalidatePath('/catalogo');

    return { success: true, data: car };
  } catch (error) {
    console.error('Error toggling featured:', error);
    return { success: false, error: 'Error al actualizar destacado' };
  }
}

/**
 * Get all cars (for admin)
 */
export async function getAdminCars(options?: {
  brand?: string;
  status?: string;
  includeDeleted?: boolean;
  sortBy?: 'createdAt' | 'price' | 'year';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<CarListResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const {
    brand,
    status,
    includeDeleted = false,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = options || {};

  const where: Record<string, unknown> = {};

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' };
  }

  if (status) {
    where.status = status as 'available' | 'sold' | 'reserved';
  }

  try {
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.car.count({ where }),
    ]);

    // Convert Decimal to number for client components
    const serializedCars = cars.map((car) => ({
      ...car,
      price: Number(car.price),
      specs: carSpecsSchema.parse(car.specs),
    }));

    return { success: true, cars: serializedCars, total };
  } catch (error) {
    console.error('Error fetching admin cars:', error);
    return { success: false, error: 'Error al obtener los vehículos' };
  }
}

/**
 * Get a single car by ID
 */
export async function getAdminCar(id: string): Promise<CarResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const validation = carDeleteSchema.shape.id.safeParse(id);
  if (!validation.success) {
    return { success: false, error: 'ID de vehículo inválido' };
  }

  try {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        technicalSheet: true,
      },
    });

    if (!car) {
      return { success: false, error: 'Vehículo no encontrado' };
    }

    return {
      success: true,
      data: {
        ...car,
        price: Number(car.price),
        specs: carSpecsSchema.parse(car.specs),
      },
    };
  } catch (error) {
    console.error('Error fetching admin car:', error);
    return { success: false, error: 'Error al obtener el vehículo' };
  }
}

/**
 * Restore a deleted car
 */
export async function restoreCar(id: string): Promise<CarResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const validation = carDeleteSchema.shape.id.safeParse(id);
  if (!validation.success) {
    return { success: false, error: 'ID de vehículo inválido' };
  }

  try {
    const car = await prisma.car.update({
      where: { id },
      data: { deletedAt: null },
    });

    revalidatePath('/admin/autos');
    revalidatePath('/catalogo');

    return { success: true, data: car };
  } catch (error) {
    console.error('Error restoring car:', error);
    return { success: false, error: 'Error al restaurar el vehículo' };
  }
}
