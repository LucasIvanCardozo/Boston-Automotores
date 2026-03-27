import { z } from 'zod';

export const fuelTypeEnum = z.enum(['nafta', 'diesel', 'electrico', 'hibrido', 'gnc']);
export const transmissionEnum = z.enum(['manual', 'automatica', 'cvt']);
export const carStatusEnum = z.enum(['available', 'sold', 'reserved']);

export const carCreateSchema = z.object({
  brand: z.string().min(1, 'La marca es obligatoria').max(100),
  model: z.string().min(1, 'El modelo es obligatorio').max(100),
  year: z.number().int().min(1900, 'El año debe ser mayor a 1900').max(new Date().getFullYear() + 1),
  price: z.number().int().positive('El precio debe ser un número positivo'),
  mileage: z.number().int().nonnegative('El kilometraje no puede ser negativo'),
  fuelType: fuelTypeEnum,
  transmission: transmissionEnum,
  status: carStatusEnum.default('available'),
  featured: z.boolean().default(false),
  description: z.string().max(5000).optional(),
  features: z.array(z.string()).max(50).default([]),
});

export const carUpdateSchema = carCreateSchema.partial();

export const carQuerySchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  fuelType: fuelTypeEnum.optional(),
  transmission: transmissionEnum.optional(),
  status: carStatusEnum.optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'price', 'year', 'mileage']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(12),
});

export const carDeleteSchema = z.object({
  id: z.string().cuid('ID de vehículo inválido'),
});

export const toggleFeaturedSchema = z.object({
  id: z.string().cuid('ID de vehículo inválido'),
});

export type CarCreateInput = z.infer<typeof carCreateSchema>;
export type CarUpdateInput = z.infer<typeof carUpdateSchema>;
export type CarQueryInput = z.infer<typeof carQuerySchema>;
export type CarDeleteInput = z.infer<typeof carDeleteSchema>;
export type ToggleFeaturedInput = z.infer<typeof toggleFeaturedSchema>;
