import { canUseAI, PlanKey } from '../../presentation/constants/plans';

export class AiUsagePolicyService {
  canGenerateComponent(plan: PlanKey, aiRequestsUsed: number): boolean {
    return canUseAI(plan, aiRequestsUsed);
  }

  remainingRequests(plan: PlanKey, used: number): number | 'unlimited' {
    const { PLANS } = require('../../presentation/constants/plans');
    const limit = PLANS[plan].aiRequestsPerMonth;
    if (limit === Infinity) return 'unlimited';
    return Math.max(0, limit - used);
  }
}
