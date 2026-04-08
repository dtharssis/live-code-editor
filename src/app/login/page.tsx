import { signIn } from '@/infrastructure/auth/authConfig';
import { redirect } from 'next/navigation';
import { auth } from '@/infrastructure/auth/authConfig';
import { C, R, F } from '@/presentation/constants/tokens';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params  = await searchParams;

  if (session?.user) redirect(params.callbackUrl ?? '/dashboard');

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      background: C.bgApp, position: 'relative', overflow: 'hidden',
    }}>
      {/* Back to home */}
      <div style={{ position: 'absolute', top: 24, left: 28, zIndex: 10 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: F.base, color: C.textMuted, textDecoration: 'none', transition: 'color 0.15s' }}>
          ← Back to home
        </Link>
      </div>

      {/* Radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 40%, rgba(197,255,191,0.04) 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Main centered area */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>

        {/* Glass card */}
        <div style={{
          width: '100%', maxWidth: 400,
          background: 'rgba(30,30,46,0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid rgba(197,255,191,0.12)`,
          borderRadius: 20,
          padding: '2.5rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.04)',
          position: 'relative', zIndex: 1,
        }}>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 56, height: 56, borderRadius: R.lg,
              background: C.bgElevated, border: `1px solid ${C.border2}`,
              marginBottom: 24, fontSize: 22, color: C.accentGreen, fontFamily: F.mono,
            }}>
              {'</>'}
            </div>
            <h1 style={{ fontFamily: F.display, fontSize: F['5xl'], fontWeight: 700, letterSpacing: '-0.02em', color: C.textPrimary, margin: '0 0 6px' }}>
              LiveCode
            </h1>
            <p style={{ fontSize: F.base, color: C.textMuted, margin: 0 }}>Shopify Component Builder</p>
          </div>

          {/* Google button */}
          <div style={{ width: '100%' }}>
            <form
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: params.callbackUrl ?? '/dashboard' });
              }}
            >
              <button
                type="submit"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  padding: '14px 24px', borderRadius: R.lg,
                  background: C.bgActive, border: `1px solid ${C.border2}`,
                  color: C.textPrimary, fontFamily: F.body, fontWeight: 600, fontSize: F.md,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </form>

            <p style={{ marginTop: 32, textAlign: 'center', fontSize: F.xs, color: `rgba(193,201,188,0.4)`, lineHeight: 1.7, maxWidth: 240, margin: '32px auto 0' }}>
              By signing in, you agree to our{' '}
              <a href="#" style={{ color: C.accentGreenDim, textDecoration: 'underline', textUnderlineOffset: 2 }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: C.accentGreenDim, textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.5rem 2.5rem', borderTop: `1px solid ${C.border1}`,
        background: C.bgApp, position: 'relative', zIndex: 1,
        flexWrap: 'wrap', gap: 16,
      }}>
        <span style={{ fontSize: F.xs, letterSpacing: '0.1em', textTransform: 'uppercase', color: `rgba(193,201,188,0.3)` }}>
          © 2025 LiveCode. All systems operational.
        </span>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {['Terms', 'Privacy', 'Security', 'Status'].map(link => (
            <a key={link} href="#" style={{ fontSize: F.xs, letterSpacing: '0.1em', textTransform: 'uppercase', color: `rgba(193,201,188,0.3)`, textDecoration: 'none', transition: 'color 0.15s' }}>
              {link}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
