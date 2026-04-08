import { auth } from '@/infrastructure/auth/authConfig';
import { getDashboardStats } from '@/lib/actions/dashboard';
import Link from 'next/link';
import { RecentActivityClient } from './_components/RecentActivityClient';
import { C, R, F, SHADOW, card, btnPrimary, btnSecondary, pageHeading, pageDescription, sectionLabel } from '@/presentation/constants/tokens';

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)   return `${mins || 1} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)    return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
}

export default async function DashboardPage() {
  const session = await auth();
  const name    = session?.user?.name?.split(' ')[0] ?? 'Developer';

  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = {
      totalComponents: 0,
      aiBuiltToday:    0,
      planName:        'Free Plan',
      aiUsed:          0,
      aiLimit:         10,
      recentActivity:  [] as { id: string; name: string; method: string; updatedAt: Date; liquidCode: string; cssCode: string; jsCode: string }[],
    };
  }

  const STATS = [
    {
      icon: '⊞', iconBg: 'rgba(197,213,220,0.15)', iconColor: C.accentPurple,
      label: 'Total Components', value: String(stats.totalComponents),
      trend: stats.totalComponents === 0 ? 'No components yet' : `${stats.totalComponents} saved`,
      trendUp: stats.totalComponents > 0,
    },
    {
      icon: '✦', iconBg: 'rgba(197,255,191,0.12)', iconColor: C.accentGreen,
      label: 'AI Built Today', value: String(stats.aiBuiltToday),
      trend: stats.aiLimit ? `${stats.aiUsed}/${stats.aiLimit} used` : `${stats.aiUsed} used`,
      trendUp: stats.aiBuiltToday > 0,
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Welcome + Status grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 24 }}>

        {/* Welcome card */}
        <div style={{ ...card, padding: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(197,255,191,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <h1 style={{ ...pageHeading, fontSize: F['6xl'], marginBottom: 12 }}>
            Dashboard, {name}
          </h1>
          <p style={{ ...pageDescription, fontSize: F.lg, marginBottom: 24, maxWidth: 460 }}>
            {stats.totalComponents === 0
              ? 'No components yet. Start building your first Shopify theme component!'
              : 'Your workspace is ready. Continue building and iterating your Shopify components.'}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/editor?new=1" style={{ ...btnSecondary, textDecoration: 'none' }}>
              {'</>'} New in Editor
            </Link>
            <Link href="/ai-builder?new=1" style={{ ...btnPrimary, textDecoration: 'none' }}>
              ✦ New with AI
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div style={{ ...card, padding: 24 }}>
          <div style={{ ...sectionLabel, marginBottom: 16 }}>System Status</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.aiBg, borderRadius: R.full, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accentGreen, display: 'inline-block' }} />
            <span style={{ fontSize: F.base, fontWeight: 600, color: C.accentGreen }}>Operational</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '⌨', label: 'CLI Version', value: 'v2.4.1' },
              { icon: '☁', label: 'Shopify Sync', value: 'Active' },
            ].map(row => (
              <div key={row.label} style={{ background: C.bgBase, borderRadius: R.lg, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: F.md, color: C.textSecondary }}>
                  <span style={{ fontSize: F.lg }}>{row.icon}</span>{row.label}
                </div>
                <span style={{ fontSize: F.base, fontFamily: F.mono, color: C.accentGreen }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, marginBottom: 24 }}>
        {STATS.map(stat => (
          <div key={stat.label} style={{ ...card, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: R.lg, background: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: F['3xl'] }}>
                <span style={{ color: stat.iconColor }}>{stat.icon}</span>
              </div>
              <span style={{
                fontSize: F.sm, fontWeight: 600,
                color: stat.trendUp ? C.accentGreen : C.textMuted,
                background: stat.trendUp ? C.aiBg : 'rgba(139,147,135,0.1)',
                padding: '3px 10px', borderRadius: R.full,
              }}>
                {stat.trend}
              </span>
            </div>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 36, color: C.textPrimary, lineHeight: 1, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: F.md, color: C.textMuted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Activity + Resources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

        {/* Recent Activity */}
        <div style={{ ...card, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: F.display, fontWeight: 700, fontSize: F['3xl'], margin: 0, color: C.textPrimary }}>Recent Activity</h2>
            <Link href="/drafts" style={{ fontSize: F.base, color: C.accentGreen, textDecoration: 'none', fontWeight: 500 }}>View All</Link>
          </div>
          <RecentActivityClient
            items={stats.recentActivity.map(item => ({
              id:         item.id,
              name:       item.name,
              method:     item.method,
              timeAgo:    timeAgo(item.updatedAt),
              liquidCode: item.liquidCode,
              cssCode:    item.cssCode,
              jsCode:     item.jsCode,
            }))}
          />
        </div>

        {/* Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontFamily: F.display, fontWeight: 700, fontSize: F['3xl'], margin: 0, color: C.textPrimary }}>Workspace</h2>

          <Link href="/editor" style={{ background: 'linear-gradient(135deg,rgba(197,255,191,0.08),rgba(202,211,241,0.06))', borderRadius: R.xl, padding: 20, border: `1px solid rgba(197,255,191,0.1)`, textDecoration: 'none', display: 'block' }}>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: F.lg, color: C.textPrimary, marginBottom: 6 }}>Quick Start</div>
            <p style={{ fontSize: F.base, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>Open the editor and start a new component in one click.</p>
          </Link>

          {[
            { icon: '✦', iconColor: C.accentGreen, title: 'AI Builder', body: 'Generate component structures and speed up repetitive work.', cta: 'Open AI Builder →', href: '/ai-builder' },
            { icon: '◫', iconColor: C.accentPurple, title: 'Draft Library', body: 'Review saved components and continue from where you stopped.', cta: 'Open Drafts →', href: '/drafts' },
          ].map(r => (
            <Link key={r.title} href={r.href} style={{ ...card, padding: 20, textDecoration: 'none', display: 'block' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: F['3xl'], color: r.iconColor }}>{r.icon}</span>
                <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: F.lg, color: C.textPrimary }}>{r.title}</div>
              </div>
              <p style={{ fontSize: F.base, color: C.textMuted, lineHeight: 1.6, margin: '0 0 10px' }}>{r.body}</p>
              <span style={{ fontSize: F.sm, color: C.accentGreen, fontWeight: 600 }}>{r.cta}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* FAB — New with AI */}
      <Link href="/ai-builder?new=1" style={{ position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, background: `linear-gradient(135deg,${C.accentGreen},${C.accentGreenMd})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: F['2xl'], color: C.onAccent, textDecoration: 'none', boxShadow: SHADOW.accent, zIndex: 20 }}>
        ✦
      </Link>
    </div>
  );
}
