import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  totalCars: number;
  availableCars: number;
  totalLeads: number;
  newLeads: number;
  totalAdmins: number;
}

/**
 * Fetch all dashboard statistics in a single parallel batch.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalCars, availableCars, totalLeads, newLeads, totalAdmins] = await Promise.all([
    prisma.car.count({ where: { deletedAt: null } }),
    prisma.car.count({ where: { status: 'available', deletedAt: null } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'new' } }),
    prisma.admin.count(),
  ]);

  return { totalCars, availableCars, totalLeads, newLeads, totalAdmins };
}
