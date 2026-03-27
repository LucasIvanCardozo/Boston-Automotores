import { z } from 'zod';

// Phone number validation for Argentine mobile numbers
const phoneRegex = /^(\+?54|0)?(9[1-9]\d{8})$/;
const argentinianPhoneRegex = /^(?:\+?54|0)?(?:11|2\d{3}|3\d{4}|\d{8,11})$/;

export const leadTypeEnum = z.enum(['sell_car', 'contact']);
export const leadStatusEnum = z.enum(['new', 'contacted', 'closed']);

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  email: z.string().email('Por favor ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').regex(phoneRegex, 'Formato de teléfono inválido'),
  message: z.string().min(1, 'El mensaje es obligatorio').max(2000),
  honeypot: z.string().max(0).optional(), // Should be empty - spam protection
  sourcePage: z.string().default('/contacto'),
});

// Sell car form schema
export const sellCarFormSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  email: z.string().email('Por favor ingresa un email válido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').regex(phoneRegex, 'Formato de teléfono inválido'),
  carBrand: z.string().min(1, 'La marca del auto es obligatoria').max(100),
  carModel: z.string().min(1, 'El modelo del auto es obligatorio').max(100),
  carYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  carMileage: z.number().int().nonnegative().optional(),
  message: z.string().max(2000).optional(),
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
