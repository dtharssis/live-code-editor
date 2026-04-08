import { ComponentEntity, ComponentStatus } from '../entities/Component';

export interface IComponentRepository {
  findByUserId(userId: string): Promise<ComponentEntity[]>;
  findByUserIdAndStatus(userId: string, status: ComponentStatus): Promise<ComponentEntity[]>;
  findById(id: string, userId: string): Promise<ComponentEntity | null>;
  create(data: Omit<ComponentEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComponentEntity>;
  update(id: string, userId: string, data: Partial<Pick<ComponentEntity, 'name' | 'liquidCode' | 'cssCode' | 'jsCode' | 'schemaJson' | 'status'>>): Promise<ComponentEntity>;
  delete(id: string, userId: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
