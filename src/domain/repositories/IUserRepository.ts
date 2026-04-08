import { UserEntity } from '../entities/User';
import { PlanKey } from '../../presentation/constants/plans';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  incrementAiUsage(id: string): Promise<void>;
  resetAiUsage(id: string): Promise<void>;
  updatePlan(id: string, plan: PlanKey): Promise<void>;
}
