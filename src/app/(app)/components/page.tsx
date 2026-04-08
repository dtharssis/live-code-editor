import { auth } from '@/infrastructure/auth/authConfig';
import { getSavedComponents } from '@/lib/actions/components';
import { C, R, F, card, btnPrimary, btnSecondary, pageHeading, pageDescription, sectionLabel } from '@/presentation/constants/tokens';
import Link from 'next/link';
import { ComponentsClient } from './_components/ComponentsClient';

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function ComponentsPage() {
  const session = await auth();
  const name    = session?.user?.name?.split(' ')[0] ?? 'Developer';

  let components: Awaited<ReturnType<typeof getSavedComponents>> = [];
  try {
    components = await getSavedComponents();
  } catch {
    // DB not yet available
  }

  const items = components.map(c => ({
    id:         c.id,
    name:       c.name,
    date:       formatDate(c.updatedAt),
    updatedAt:  c.updatedAt.toISOString(),
    method:     c.method,
    liquidCode: c.liquidCode,
    cssCode:    c.cssCode,
    jsCode:     c.jsCode,
  }));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ ...pageHeading, marginBottom: 6 }}>Components</h1>
          <p style={{ ...pageDescription }}>Your saved, production-ready Shopify components</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/editor?new=1" style={{ ...btnSecondary, textDecoration: 'none' }}>
            {'</>'} Editor
          </Link>
          <Link href="/ai-builder?new=1" style={{ ...btnPrimary, textDecoration: 'none' }}>
            ✦ AI Builder
          </Link>
        </div>
      </div>

      <ComponentsClient items={items} />
    </div>
  );
}
