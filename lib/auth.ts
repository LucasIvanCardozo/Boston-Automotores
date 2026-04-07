import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { JwtPayload } from '@/lib/schemas/admin';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '8h';
const COOKIE_NAME = 'admin_session';

// Bcrypt configuration
const BCRYPT_ROUNDS = 12;

// JWT_SECRET validation — checked once at startup, cached for subsequent calls
let jwtSecretValidated = false;
let jwtSecretError: Error | null = null;

function validateJwtSecret(): void {
  if (jwtSecretValidated) {
    if (jwtSecretError) throw jwtSecretError;
    return;
  }
  jwtSecretValidated = true;
  if (!JWT_SECRET) {
    jwtSecretError = new Error(
      'JWT_SECRET environment variable is not set. Please add JWT_SECRET to your .env file.'
    );
    throw jwtSecretError;
  }
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for an admin
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  validateJwtSecret();
  
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  validateJwtSecret();
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Cookie configuration for admin session
 */
export const ADMIN_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 8, // 8 hours in seconds
};

/**
 * Set admin session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_OPTIONS.name, token, {
    httpOnly: ADMIN_COOKIE_OPTIONS.httpOnly,
    secure: ADMIN_COOKIE_OPTIONS.secure,
    sameSite: ADMIN_COOKIE_OPTIONS.sameSite,
    path: ADMIN_COOKIE_OPTIONS.path,
    maxAge: ADMIN_COOKIE_OPTIONS.maxAge,
  });
}

/**
 * Clear admin session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_OPTIONS.name);
}

/**
 * Get admin session from cookies
 */
export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_OPTIONS.name)?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

/**
 * Check if request has valid admin session
 * Also verifies that the admin still exists in the database
 */
export async function requireAuth(): Promise<JwtPayload> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('No autorizado');
  }
  
  // Verify that the admin still exists in the database
  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId },
  });
  
  if (!admin) {
    // Admin was deleted, clear the cookie
    await clearSessionCookie();
    throw new Error('No autorizado');
  }
  
  return session;
}
