export const PLANS = {
  FREE: {
    key: 'FREE' as const,
    name: 'Free',
    badge: 'Free Plan',
    price: 0,
    aiRequestsPerMonth: 10,
    componentsLimit: 5,
    features: [
      'Live Code Editor',
      'Live Preview',
      'Export ZIP',
      'Basic Guides (read-only)',
    ],
  },
  INITIAL: {
    key: 'INITIAL' as const,
    name: 'Initial',
    badge: 'Initial Plan',
    price: 9,
    aiRequestsPerMonth: 50,
    componentsLimit: 20,
    features: [
      'Everything in Free',
      'AI Builder (50 requests/mo)',
      'Drafts Library',
    ],
  },
  INTER: {
    key: 'INTER' as const,
    name: 'Inter',
    badge: 'Inter Plan',
    price: 29,
    aiRequestsPerMonth: 200,
    componentsLimit: 100,
    features: [
      'Everything in Initial',
      'Priority AI (200 requests/mo)',
      'All Guides',
      'Snippet Library',
    ],
  },
  MAX: {
    key: 'MAX' as const,
    name: 'Max',
    badge: 'Dev Studio Max',
    price: 79,
    aiRequestsPerMonth: Infinity,
    componentsLimit: Infinity,
    features: [
      'Everything in Inter',
      'Unlimited AI requests',
      'CLI Sync',
      'GitHub Webhooks',
      'API Access',
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanKey];

export function getPlan(key: PlanKey) {
  return PLANS[key];
}

export function canUseAI(plan: PlanKey, used: number): boolean {
  const limit = PLANS[plan].aiRequestsPerMonth;
  return limit === Infinity || used < limit;
}

export function canAddComponent(plan: PlanKey, count: number): boolean {
  const limit = PLANS[plan].componentsLimit;
  return limit === Infinity || count < limit;
}
