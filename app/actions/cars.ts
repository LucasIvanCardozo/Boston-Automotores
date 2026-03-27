'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { carCreateSchema, carUpdateSchema, carDeleteSchema, toggleFeaturedSchema } from '@/lib/schemas/car';
import type { CarCreateInput, CarUpdateInput } from '@/lib/schemas/car';
import { requireAuth } from '@/lib/auth';

export interface CarResult {
  success: boolean;
  error?: string;
  data?: Awaited<ReturnType<typeof prisma.car.findUnique>>;
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
    features: [],
  };

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

    return { success: true, data: car };
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

  const rawData: CarUpdateInput = {
    brand: formData.get('brand') as string,
    model: formData.get('model') as string,
    year: formData.get('year') ? parseInt(formData.get('year') as string, 10) : undefined,
    price: formData.get('price') ? parseInt(formData.get('price') as string, 10) : undefined,
    mileage: formData.get('mileage') ? parseInt(formData.get('mileage') as string, 10) : undefined,
    fuelType: formData.get('fuelType') as CarUpdateInput['fuelType'],
    transmission: formData.get('transmission') as CarUpdateInput['transmission'],
    status: (formData.get('status') as CarUpdateInput['status']) || undefined,
    featured: formData.get('featured') === 'true' ? true : formData.get('featured') === 'false' ? false : undefined,
    description: formData.get('description') as string || undefined,
    features: formData.get('features')
      ? (JSON.parse(formData.get('features') as string) as string[])
      : undefined,
  };

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

    revalidatePath('/admin/autos');
    revalidatePath(`/admin/autos/${id}/editar`);
    revalidatePath('/catalogo');

    return { success: true, data: car };
  } catch (error) {
    console.error('Error updating car:', error);
    return { success: false, error: 'Error al actualizar el vehículo' };
  }
}

/**
 * Delete a car (soft delete)
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
    const car = await prisma.car.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath('/admin/autos');
    revalidatePath('/catalogo');

    return { success: true, data: car };
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
    const serializedCars = cars.map(car => ({
      ...car,
      price: Number(car.price),
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

    return { success: true, data: car };
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
