import { auth } from '@/infrastructure/auth/authConfig';
import { getComponents } from '@/lib/actions/components';
import { PLANS } from '@/presentation/constants/plans';
import Link from 'next/link';
import { DraftsClient } from './_components/DraftsClient';
import { C, R, F, card, btnPrimary, btnSecondary, pageHeading, pageDescription } from '@/presentation/constants/tokens';

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function DraftsPage() {
  const session = await auth();
  const plan     = (session?.user?.plan ?? 'FREE') as keyof typeof PLANS;
  const planData = PLANS[plan];

  let components: Awaited<ReturnType<typeof getComponents>> = [];
  try {
    components = await getComponents();
  } catch {
    // DB not yet available — show empty state
  }

  const count   = components.length;
  const limit   = planData.componentsLimit;
  const pct     = limit === Infinity ? 20 : Math.min(100, Math.round((count / limit) * 100));
  const atLimit = limit !== Infinity && count >= limit;

  const drafts = components.map(c => ({
    id:         c.id,
    name:       c.name,
    date:       formatDate(c.updatedAt),
    updatedAt:  c.updatedAt.toISOString(),
    method:     c.method,
    stack:      c.method === 'AI_GENERATED' ? 'Liquid + CSS' : 'Liquid',
    liquidCode: c.liquidCode,
    cssCode:    c.cssCode,
    jsCode:     c.jsCode,
  }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ ...pageHeading, marginBottom: 6 }}>Drafts</h1>
          <p style={{ ...pageDescription }}>Manage and evolve your Shopify component library</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...card, padding: '8px 14px' }}>
            <div style={{ width: 120, height: 4, background: C.bgBase, borderRadius: R.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: atLimit ? C.error : `linear-gradient(90deg,${C.accentGreen},${C.accentGreenMd})`, borderRadius: R.full }} />
            </div>
            <span style={{ fontSize: F.sm, color: C.textMuted, whiteSpace: 'nowrap' }}>
              {count} / {limit === Infinity ? '∞' : limit} components used
            </span>
          </div>

          {atLimit ? (
            <Link href="#" style={{ ...btnPrimary, textDecoration: 'none' }}>
              Upgrade to add more
            </Link>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/editor?new=1" style={{ ...btnSecondary, textDecoration: 'none' }}>
                {'</>'} Editor
              </Link>
              <Link href="/ai-builder?new=1" style={{ ...btnPrimary, textDecoration: 'none' }}>
                ✦ AI Builder
              </Link>
            </div>
          )}
        </div>
      </div>

      <DraftsClient drafts={drafts} />
    </div>
  );
}
