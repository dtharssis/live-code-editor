'use server';

import { auth } from '@/infrastructure/auth/authConfig';
import { prisma } from '@/infrastructure/db/client';
import { PLANS } from '@/presentation/constants/plans';
import type { PlanKey } from '@/presentation/constants/plans';

export interface DashboardStats {
  totalComponents: number;
  aiBuiltToday:    number;
  planName:        string;
  aiUsed:          number;
  aiLimit:         number | null; // null = unlimited
  recentActivity:  {
    id:         string;
    name:       string;
    method:     string;
    updatedAt:  Date;
    liquidCode: string;
    cssCode:    string;
    jsCode:     string;
  }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId   = session.user.id;
  const plan     = (session.user.plan ?? 'FREE') as PlanKey;
  const planData = PLANS[plan];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalComponents, aiBuiltToday, recent] = await Promise.all([
    prisma.component.count({ where: { userId } }),
    prisma.component.count({
      where: { userId, method: 'AI_GENERATED', createdAt: { gte: todayStart } },
    }),
    prisma.component.findMany({
      where:   { userId },
      orderBy: { updatedAt: 'desc' },
      take:    5,
      select:  { id: true, name: true, method: true, updatedAt: true, liquidCode: true, cssCode: true, jsCode: true },
    }),
  ]);

  return {
    totalComponents,
    aiBuiltToday,
    planName: planData.badge,
    aiUsed:   session.user.aiRequestsUsed ?? 0,
    aiLimit:  planData.aiRequestsPerMonth === Infinity ? null : planData.aiRequestsPerMonth,
    recentActivity: recent,
  };
}
