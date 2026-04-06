'use server'

import { redirect } from 'next/navigation'
import type { LoginInput } from '@/lib/schemas/admin'
import { loginSchema } from '@/lib/schemas/admin'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken, setSessionCookie, clearSessionCookie } from '@/lib/auth'
import { AdminRole } from '@/prisma/generated/enums'

export interface LoginResult {
  success: boolean
  error?: string
}

/**
 * Admin login action
 */
export async function loginAction(formData: FormData): Promise<LoginResult> {
  const rawData: LoginInput = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  }

  // Validate input
  const validation = loginSchema.safeParse(rawData)
  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message
    return {
      success: false,
      error: firstError || 'Datos inválidos',
    }
  }

  const { username, password } = validation.data

  try {
    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username },
    })

    if (!admin) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      }
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.passwordHash)
    if (!isValid) {
      return {
        success: false,
        error: 'Credenciales inválidas',
      }
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate JWT token
    const token = generateToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role as AdminRole,
    })

    // Set session cookie
    await setSessionCookie(token)
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Error interno del servidor',
    }
  }
  // Redirect to admin dashboard on success
  redirect('/admin')
}

/**
 * Admin logout action
 */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie()
  redirect('/admin/login')
}

/**
 * Get current admin session (for client components)
 */
export async function getCurrentAdmin() {
  const { getSession } = await import('@/lib/auth')
  return getSession()
}
