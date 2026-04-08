import Link from 'next/link';

const STEPS = [
  { num: '01', title: 'Create & Author', icon: '✏', desc: 'Write component logic using Liquid templating, scoped CSS, and JavaScript. The editor provides syntax highlighting and live validation for all three layers.' },
  { num: '02', title: 'Structure',        icon: '⬡', desc: "The system automatically organizes your logic into Shopify's native folder hierarchy — sections, snippets, and assets — following Theme Architecture 2.0 specifications." },
  { num: '03', title: 'Live Preview',     icon: '👁', desc: "See your component render in real-time as you type. Toggle between desktop, tablet, and mobile viewports. Changes sync instantly with live preview." },
  { num: '04', title: 'Export & Deploy',  icon: '🚀', desc: 'One-click export generates a zipped file structure ready for Shopify Theme installation. CLI users can push directly to their development theme.' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#121221', color: '#e3e0f7', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ height: 64, background: 'rgba(18,18,33,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(65,73,63,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 20, color: '#a6e3a1', textDecoration: 'none' }}>Live Code</Link>
        <Link href="/login" style={{ fontSize: 13, color: '#c5ffbf', textDecoration: 'none', padding: '7px 18px', background: 'rgba(197,255,191,0.1)', borderRadius: 8, border: '1px solid rgba(197,255,191,0.15)', fontWeight: 600 }}>Get Started</Link>
      </nav>

      <section style={{ maxWidth: 960, margin: '0 auto', padding: '5rem 2rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#292839', border: '1px solid rgba(65,73,63,0.2)', borderRadius: 999, padding: '5px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#b4f2af' }}>The Live Code Workflow</span>
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', letterSpacing: '-0.025em', margin: '0 0 16px', color: '#e3e0f7', lineHeight: 1.1 }}>
            How Live Code Works
          </h1>
          <p style={{ fontSize: 17, color: '#c1c9bc', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>
            From component idea to Shopify theme in four Live Code steps.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24 }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ background: '#1e1e2e', borderRadius: 20, padding: 32, border: '1px solid rgba(65,73,63,0.12)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 72, color: 'rgba(197,255,191,0.04)', lineHeight: 1, userSelect: 'none' }}>{step.num}</div>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: i < 2 ? 'rgba(197,255,191,0.1)' : 'rgba(202,211,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>
                {step.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c5ffbf', marginBottom: 10 }}>Step {step.num}</div>
              <h3 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 20, margin: '0 0 12px', color: '#e3e0f7' }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: '#c1c9bc', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 60 }}>
          <Link href="/login" style={{
            display: 'inline-block', textDecoration: 'none',
            background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)',
            color: '#00390c', fontFamily: 'Space Grotesk, system-ui, sans-serif',
            fontWeight: 700, fontSize: 17, padding: '16px 40px', borderRadius: 14,
          }}>
            Start Building for Free
          </Link>
          <div style={{ marginTop: 12, fontSize: 12, color: '#41493f' }}>No credit card required</div>
        </div>
      </section>
    </div>
  );
}
