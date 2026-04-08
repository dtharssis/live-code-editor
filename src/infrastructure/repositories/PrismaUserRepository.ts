import { prisma } from '../db/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserEntity } from '../../domain/entities/User';
import { PlanKey } from '../../presentation/constants/plans';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async incrementAiUsage(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data:  { aiRequestsUsed: { increment: 1 } },
    });
  }

  async resetAiUsage(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data:  { aiRequestsUsed: 0, aiRequestsResetAt: new Date() },
    });
  }

  async updatePlan(id: string, plan: PlanKey): Promise<void> {
    await prisma.user.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data:  { plan: plan as any },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toEntity(u: any): UserEntity {
    return {
      id:                u.id,
      email:             u.email,
      name:              u.name ?? null,
      image:             u.image ?? null,
      plan:              u.plan as PlanKey,
      aiRequestsUsed:    u.aiRequestsUsed,
      aiRequestsResetAt: u.aiRequestsResetAt,
      createdAt:         u.createdAt,
    };
  }
}
