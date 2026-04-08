import { auth } from '@/infrastructure/auth/authConfig';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/presentation/components/layout/AppSidebar';
import { AppTopBar } from '@/presentation/components/layout/AppTopBar';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#121221' }}>
      {/* Sidebar */}
      <AppSidebar
        userName={user.name ?? 'Developer'}
        userImage={user.image ?? null}
        plan={(user.plan as string) ?? 'FREE'}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 256, minHeight: '100vh' }}>
        <AppTopBar />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
