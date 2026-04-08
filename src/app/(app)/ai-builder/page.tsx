import { AIBuilderClient } from '@/presentation/components/ai/AIBuilderClient';
import { auth } from '@/infrastructure/auth/authConfig';
import { PLANS } from '@/presentation/constants/plans';

export default async function AIBuilderPage({ searchParams }: { searchParams: Promise<{ new?: string; continue?: string }> }) {
  const session = await auth();
  const plan    = (session?.user?.plan ?? 'FREE') as keyof typeof PLANS;
  const used    = session?.user?.aiRequestsUsed ?? 0;
  const limit   = PLANS[plan].aiRequestsPerMonth;
  const canUse  = limit === Infinity || used < limit;
  const { new: isNewParam, continue: isContinueParam } = await searchParams;

  return (
    <AIBuilderClient
      planKey={plan}
      aiRequestsUsed={used}
      canUseAI={canUse}
      isNew={isNewParam === '1'}
      isContinue={isContinueParam === '1'}
    />
  );
}
