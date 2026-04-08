import Link from 'next/link';
import { auth } from '@/infrastructure/auth/authConfig';

export default async function GuidesLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div style={{ minHeight: '100vh', background: '#121221' }}>
      {/* Public top bar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 40,
        background: '#0d0d1c', borderBottom: '1px solid rgba(65,73,63,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 18, color: '#a6e3a1', textDecoration: 'none' }}>
            Live Code
          </Link>
          <Link href="/guides" style={{ fontSize: 13, fontWeight: 600, color: '#c5ffbf', textDecoration: 'none' }}>
            Guides
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {session?.user ? (
            <Link href="/dashboard" style={{
              fontSize: 13, fontWeight: 700, color: '#00390c',
              background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)',
              padding: '7px 18px', borderRadius: 8, textDecoration: 'none',
            }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: 13, color: 'rgba(227,224,247,0.6)', textDecoration: 'none' }}>
                Sign In
              </Link>
              <Link href="/login" style={{
                fontSize: 13, fontWeight: 700, color: '#00390c',
                background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)',
                padding: '7px 18px', borderRadius: 8, textDecoration: 'none',
              }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      <main style={{ paddingTop: 56, maxWidth: 1100, margin: '0 auto', padding: '88px 32px 64px' }}>
        {children}
      </main>
    </div>
  );
}
