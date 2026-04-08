import { prisma } from '../db/client';
import { IComponentRepository } from '../../domain/repositories/IComponentRepository';
import { ComponentEntity, ComponentMethod, ComponentStatus } from '../../domain/entities/Component';

export class PrismaComponentRepository implements IComponentRepository {
  async findByUserId(userId: string): Promise<ComponentEntity[]> {
    const rows = await prisma.component.findMany({
      where:   { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(this.toEntity);
  }

  async findByUserIdAndStatus(userId: string, status: ComponentStatus): Promise<ComponentEntity[]> {
    const rows = await prisma.component.findMany({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where:   { userId, status: status as any },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(this.toEntity);
  }

  async findById(id: string, userId: string): Promise<ComponentEntity | null> {
    const row = await prisma.component.findFirst({ where: { id, userId } });
    return row ? this.toEntity(row) : null;
  }

  async create(data: Omit<ComponentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComponentEntity> {
    const row = await prisma.component.create({
      data: {
        userId:     data.userId,
        name:       data.name,
        liquidCode: data.liquidCode,
        cssCode:    data.cssCode,
        jsCode:     data.jsCode,
        schemaJson: data.schemaJson,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        method:     data.method as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status:     data.status as any,
      },
    });
    return this.toEntity(row);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<ComponentEntity, 'name' | 'liquidCode' | 'cssCode' | 'jsCode' | 'schemaJson' | 'status'>>,
  ): Promise<ComponentEntity> {
    const row = await prisma.component.update({
      where: { id },
      data: {
        ...(data.name       !== undefined && { name:       data.name }),
        ...(data.liquidCode !== undefined && { liquidCode: data.liquidCode }),
        ...(data.cssCode    !== undefined && { cssCode:    data.cssCode }),
        ...(data.jsCode     !== undefined && { jsCode:     data.jsCode }),
        ...(data.schemaJson !== undefined && { schemaJson: data.schemaJson }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.status     !== undefined && { status:     data.status as any }),
      },
    });
    if (row.userId !== userId) throw new Error('Forbidden');
    return this.toEntity(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.component.deleteMany({ where: { id, userId } });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.component.count({ where: { userId } });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toEntity(row: any): ComponentEntity {
    return {
      id:         row.id,
      userId:     row.userId,
      name:       row.name,
      liquidCode: row.liquidCode,
      cssCode:    row.cssCode,
      jsCode:     row.jsCode,
      schemaJson: row.schemaJson,
      method:     row.method as ComponentMethod,
      status:     (row.status ?? 'DRAFT') as ComponentStatus,
      createdAt:  row.createdAt,
      updatedAt:  row.updatedAt,
    };
  }
}
