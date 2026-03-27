import { z } from 'zod';

export const adminRoleEnum = z.enum(['admin', 'super_admin']);

// Admin login schema
export const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es obligatorio').max(50),
  password: z.string().min(1, 'La contraseña es obligatoria').max(100),
});

// Admin creation schema (for creating new admins)
export const adminCreateSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  role: adminRoleEnum.default('admin'),
});

// Admin update schema
export const adminUpdateSchema = z.object({
  id: z.string().cuid('ID de administrador inválido'),
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos')
    .optional(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .optional(),
  role: adminRoleEnum.optional(),
});

// JWT payload schema
export const jwtPayloadSchema = z.object({
  adminId: z.string(),
  username: z.string(),
  role: adminRoleEnum,
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Session schema
export const sessionSchema = z.object({
  adminId: z.string(),
  username: z.string(),
  role: adminRoleEnum,
  expiresAt: z.date(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type AdminCreateInput = z.infer<typeof adminCreateSchema>;
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;
export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
export type Session = z.infer<typeof sessionSchema>;
