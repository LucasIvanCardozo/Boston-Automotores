'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export type LeadStatus = 'new' | 'contacted' | 'closed';
export type LeadType = 'sell_car' | 'contact';

export interface LeadFilters {
  status?: LeadStatus;
  type?: LeadType;
  search?: string;
}

export interface LeadResult {
  success: boolean;
  error?: string;
  lead?: Awaited<ReturnType<typeof prisma.lead.findUnique>>;
}

export interface LeadListResult {
  success: boolean;
  error?: string;
  leads?: Awaited<ReturnType<typeof prisma.lead.findMany>>;
  total?: number;
}

/**
 * Get all leads with optional filters
 */
export async function getLeads(
  filters: LeadFilters = {},
  options: { page?: number; limit?: number } = {}
): Promise<LeadListResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const { status, type, search } = filters;
  const { page = 1, limit = 20 } = options;

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return { success: true, leads, total };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error: 'Error al obtener las consultas' };
  }
}

/**
 * Get a single lead by ID
 */
export async function getLead(id: string): Promise<LeadResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return { success: false, error: 'Consulta no encontrada' };
    }

    return { success: true, lead };
  } catch (error) {
    console.error('Error fetching lead:', error);
    return { success: false, error: 'Error al obtener la consulta' };
  }
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  // Validate inputs
  if (!id || typeof id !== 'string') {
    return { success: false, error: 'ID de consulta inválido' };
  }

  if (!status || !['new', 'contacted', 'closed'].includes(status)) {
    return { success: false, error: 'Estado inválido' };
  }

  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        status,
        contactedAt: status === 'contacted' ? new Date() : undefined,
      },
    });

    revalidatePath('/admin/consultas');

    return { success: true };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, error: 'Error al actualizar' };
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<LeadResult> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const lead = await prisma.lead.delete({
      where: { id },
    });

    revalidatePath('/admin/consultas');

    return { success: true, lead };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, error: 'Error al eliminar la consulta' };
  }
}

/**
 * Get lead statistics for dashboard
 */
export async function getLeadStats(): Promise<{
  success: boolean;
  error?: string;
  stats?: {
    total: number;
    new: number;
    contacted: number;
    closed: number;
  };
}> {
  try {
    await requireAuth();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const [total, newCount, contactedCount, closedCount] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.lead.count({ where: { status: 'contacted' } }),
      prisma.lead.count({ where: { status: 'closed' } }),
    ]);

    return {
      success: true,
      stats: {
        total,
        new: newCount,
        contacted: contactedCount,
        closed: closedCount,
      },
    };
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return { success: false, error: 'Error al obtener estadísticas' };
  }
}
