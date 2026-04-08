import { PlanKey } from '../../presentation/constants/plans';

export interface UserEntity {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  plan: PlanKey;
  aiRequestsUsed: number;
  aiRequestsResetAt: Date;
  createdAt: Date;
}
