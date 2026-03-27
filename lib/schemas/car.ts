import { z } from 'zod';

// Enums
export const fuelTypeEnum = z.enum(['nafta', 'diesel', 'electrico', 'hibrido', 'gnc']);
export const transmissionEnum = z.enum(['manual', 'automatica', 'cvt']);
export const carStatusEnum = z.enum(['available', 'sold', 'reserved']);
export const steeringEnum = z.enum(['mechanical', 'hydraulic', 'electric']);
export const headlightsEnum = z.enum(['halogen', 'led', 'xenon', 'full-led']);

// Sensor options
export const SENSOR_OPTIONS = ['parking', 'reverse', 'blindspot', 'rain'] as const;
export const sensorEnum = z.enum(SENSOR_OPTIONS);

// Security feature options
export const SECURITY_FEATURE_OPTIONS = [
  'airbags',
  'abs',
  'esp',
  'traction-control',
  'brake-assist',
  'stabilitätsprogramm',
  'hill-holder',
  'isofix',
] as const;
export const securityFeatureEnum = z.enum(SECURITY_FEATURE_OPTIONS);

// Comfort feature options
export const COMFORT_FEATURE_OPTIONS = [
  'cruise-control',
  'sunroof',
  'leather-seats',
  'heated-seats',
  'electric-mirrors',
  'electric-windows',
  'climate-control',
  'dual-zone-climate',
  'start-stop',
  'parking-brake-electric',
  'sunroof-panoramic',
  'ambient-lighting',
] as const;
export const comfortFeatureEnum = z.enum(COMFORT_FEATURE_OPTIONS);

// Car Specifications Schema
export const carSpecsSchema = z.object({
  engine: z.string().max(100, 'El motor no puede exceder 100 caracteres').optional(),
  steering: steeringEnum.optional(),
  color: z.string().max(50, 'El color no puede exceder 50 caracteres').optional(),
  doors: z.number().int().min(2, 'El número de puertas debe ser entre 2 y 5').max(5, 'El número de puertas debe ser entre 2 y 5').optional(),
  wheels: z.string().max(100).optional(),
  wheelSize: z.string().max(50).optional(),
  audioSystem: z.string().max(200).optional(),
  headlights: headlightsEnum.optional(),
  sensors: z.array(z.string()).max(10).default([]),
  securityFeatures: z.array(z.string()).max(20).default([]),
  comfortFeatures: z.array(z.string()).max(20).default([]),
});

export type CarSpecs = z.infer<typeof carSpecsSchema>;

// Car Create Schema with full specifications
const currentYear = new Date().getFullYear();

export const carCreateSchema = z.object({
  brand: z.string().min(1, 'La marca es obligatoria').max(100, 'La marca no puede exceder 100 caracteres'),
  model: z.string().min(1, 'El modelo es obligatorio').max(100, 'El modelo no puede exceder 100 caracteres'),
  year: z.number().int().min(1900, `El año debe ser entre 1900 y ${currentYear}`).max(currentYear + 1, `El año no puede ser mayor a ${currentYear + 1}`),
  price: z.number().int().positive('El precio debe ser mayor a 0'),
  mileage: z.number().int().nonnegative('El kilometraje no puede ser negativo'),
  fuelType: z.enum(['nafta', 'diesel', 'electrico', 'hibrido', 'gnc'], {
    errorMap: () => ({ message: 'Seleccione un tipo de combustible' }),
  }),
  transmission: z.enum(['manual', 'automatica', 'cvt'], {
    errorMap: () => ({ message: 'Seleccione el tipo de transmisión' }),
  }),
  status: carStatusEnum.default('available'),
  featured: z.boolean().default(false),
  description: z.string().max(5000, 'La descripción no puede exceder 5000 caracteres').optional(),
  features: z.array(z.string()).max(50).default([]),
  specs: carSpecsSchema.optional(),
});

// NOTE: .partial() makes fields optional (undefined passes), but if a value IS provided,
// validators like .positive() still run. For updates, we create a schema that removes
// .positive() from price to allow 0 (which the form defaults to when no changes made).
// The business logic still enforces positive prices at the service layer.
const carUpdateSchemaBase = carCreateSchema.omit({
  price: true,
});

export const carUpdateSchema = carUpdateSchemaBase.extend({
  price: z.number().int().nonnegative('El precio no puede ser negativo').optional(),
});

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
export type FuelType = z.infer<typeof fuelTypeEnum>;
export type Transmission = z.infer<typeof transmissionEnum>;
export type CarStatus = z.infer<typeof carStatusEnum>;
export type Steering = z.infer<typeof steeringEnum>;
export type Headlights = z.infer<typeof headlightsEnum>;
