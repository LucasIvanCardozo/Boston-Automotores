import { z } from 'zod';

// Phone number validation for Argentine mobile numbers
const phoneRegex = /^(\+?54|0)?(9[1-9]\d{8})$/;
const argentinianPhoneRegex = /^(?:\+?54|0)?(?:11|2\d{3}|3\d{4}|\d{8,11})$/;

export const leadTypeEnum = z.enum(['sell_car', 'contact']);
export const leadStatusEnum = z.enum(['new', 'contacted', 'closed']);

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').min(2, 'Mínimo 2 caracteres').max(200, 'Máximo 200 caracteres'),
  email: z.string().min(1, 'El email es obligatorio').email('Ingrese un email válido (ejemplo@correo.com)'),
  phone: z.string().min(1, 'El teléfono es obligatorio').min(10, 'El teléfono debe tener al menos 10 dígitos').regex(phoneRegex, 'Ingrese un teléfono válido (ej: 2234567890)'),
  message: z.string().min(1, 'El mensaje es obligatorio').min(10, 'Mínimo 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
  honeypot: z.string().max(0).optional(), // Should be empty - spam protection
  sourcePage: z.string().default('/contacto'),
});

// Sell car form schema
export const sellCarFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').min(2, 'Mínimo 2 caracteres').max(200),
  email: z.string().min(1, 'El email es obligatorio').email('Ingrese un email válido (ejemplo@correo.com)'),
  phone: z.string().min(1, 'El teléfono es obligatorio').min(10, 'El teléfono debe tener al menos 10 dígitos').regex(phoneRegex, 'Ingrese un teléfono válido (ej: 2234567890)'),
  carBrand: z.string().min(1, 'La marca del auto es obligatoria').max(100, 'Máximo 100 caracteres'),
  carModel: z.string().min(1, 'El modelo del auto es obligatorio').max(100, 'Máximo 100 caracteres'),
  carYear: z.number().int().min(1900, 'El año debe ser entre 1900 y ' + new Date().getFullYear()).max(new Date().getFullYear() + 1).optional(),
  carMileage: z.number().int().nonnegative('El kilometraje no puede ser negativo').optional(),
  message: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  honeypot: z.string().max(0).optional(), // Should be empty - spam protection
  sourcePage: z.string().default('/vende-tu-auto'),
});

// Lead update schema (for admin)
export const leadUpdateSchema = z.object({
  id: z.string().cuid('ID de consulta inválido'),
  status: leadStatusEnum.optional(),
  contactedAt: z.date().optional(),
});

// Lead query schema (for admin filtering)
export const leadQuerySchema = z.object({
  type: leadTypeEnum.optional(),
  status: leadStatusEnum.optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type SellCarFormData = z.infer<typeof sellCarFormSchema>;
export type LeadUpdateData = z.infer<typeof leadUpdateSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
