import Link from 'next/link';

const CATEGORIES = [
  { icon: '{}', color: '#c5ffbf', title: 'Liquid Basics', desc: 'Fundamental syntax, filters, tags, and object mapping in Shopify.', count: 12, minPlan: 'FREE' },
  { icon: '⬡', color: '#cba6f7', title: 'Building Sections', desc: 'Customizable theme sections using schema settings and Liquid blocks.', count: 9, minPlan: 'FREE' },
  { icon: '.css', color: '#89b4fa', title: 'CSS in Assets', desc: 'Best practices for styling, using Shopify\'s CDN, and asset management.', count: 8, minPlan: 'FREE' },
  { icon: '⚡', color: '#f9e2af', title: 'Performance', desc: 'Optimize load times, lazy loading, and Shopify\'s image transformation API.', count: 6, minPlan: 'INTER' },
];

const LEARNING_PATH = [
  { step: 1, title: 'Liquid Basics',              status: 'completed',   detail: 'Completed 4 days ago' },
  { step: 2, title: 'Building Dynamic Sections',  status: 'in_progress', detail: '2 lessons remaining' },
  { step: 3, title: 'Asset Optimization (CSS/JS)', status: 'locked',    detail: 'Complete Step 2 to unlock' },
];

export default function GuidesPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 26, margin: '0 0 6px', color: '#e3e0f7', letterSpacing: '-0.02em' }}>Guides</h1>
        <p style={{ fontSize: 13, color: '#8b9387', margin: 0 }}>Master Shopify Liquid development, step by step.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>

        {/* Main content */}
        <div>
          {/* Currently Learning */}
          <div style={{ background: '#1e1e2e', borderRadius: 16, padding: 24, marginBottom: 24, border: '1px solid rgba(65,73,63,0.12)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(197,255,191,0.04)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c5ffbf', marginBottom: 12 }}>Currently Learning</div>
            <h2 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 20, margin: '0 0 8px', color: '#e3e0f7' }}>Shopify Liquid Fundamentals</h2>
            <p style={{ fontSize: 13, color: '#8b9387', lineHeight: 1.6, margin: '0 0 20px' }}>Master the templating language that powers millions of stores. From variable assignments to complex control flows.</p>

            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#c1c9bc' }}>Progress</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#c5ffbf' }}>68%</span>
              </div>
              <div style={{ height: 6, background: '#0d0d1c', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg,#c5ffbf,#a6e3a1)', borderRadius: 999 }} />
              </div>
            </div>

            <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
              ▶ Resume Course
            </button>
          </div>

          {/* Category grid */}
          <h3 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 16px', color: '#e3e0f7' }}>Browse Library</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <div key={cat.title} style={{ background: '#1e1e2e', borderRadius: 14, padding: 20, border: '1px solid rgba(65,73,63,0.12)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                {cat.minPlan !== 'FREE' && (
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, fontWeight: 700, color: '#c5ffbf', background: 'rgba(197,255,191,0.1)', padding: '2px 8px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {cat.minPlan}+
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, color: cat.color }}>{cat.icon}</span>
                  <span style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 600, fontSize: 14, color: '#e3e0f7' }}>{cat.title}</span>
                </div>
                <p style={{ fontSize: 12, color: '#8b9387', lineHeight: 1.6, margin: '0 0 12px' }}>{cat.desc}</p>
                <span style={{ fontSize: 11, color: '#41493f' }}>{cat.count} articles</span>
              </div>
            ))}
          </div>

          {/* Featured article */}
          <div style={{ background: '#1e1e2e', borderRadius: 14, padding: 20, marginTop: 16, border: '1px solid rgba(65,73,63,0.12)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#99d595', marginBottom: 10 }}>Featured Article</div>
            <h4 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 8px', color: '#e3e0f7' }}>Snippet Best Practices</h4>
            <p style={{ fontSize: 12, color: '#8b9387', lineHeight: 1.6, margin: '0 0 14px' }}>Reusable pieces of code that live in the <code style={{ color: '#cba6f7', background: '#0d0d1c', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>/snippets</code> folder and can be rendered anywhere in your theme.</p>
            <div style={{ background: '#0d0d1c', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, marginBottom: 14 }}>
              <span style={{ color: '#cba6f7' }}>{'{%'}</span>
              <span style={{ color: '#e3e0f7' }}> render </span>
              <span style={{ color: '#b4f2af' }}>&apos;icon-arrow&apos;</span>
              <span style={{ color: '#cba6f7' }}>{' %}'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, color: '#41493f' }}>1.2k views</span>
              {['#Liquid', '#Optimization'].map(tag => (
                <span key={tag} style={{ fontSize: 10, color: '#8b9387', background: '#292839', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Learning Path sidebar */}
        <div>
          <div style={{ background: '#1e1e2e', borderRadius: 16, padding: 20, border: '1px solid rgba(65,73,63,0.12)', position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 20px', color: '#e3e0f7' }}>Learning Path</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {LEARNING_PATH.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  {/* Step indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                      background: step.status === 'completed' ? 'linear-gradient(135deg,#c5ffbf,#a6e3a1)' : step.status === 'in_progress' ? '#292839' : '#1a1a2a',
                      color: step.status === 'completed' ? '#00390c' : step.status === 'in_progress' ? '#c5ffbf' : '#41493f',
                      border: step.status === 'in_progress' ? '2px solid rgba(197,255,191,0.3)' : '2px solid transparent',
                    }}>
                      {step.status === 'completed' ? '✓' : step.step}
                    </div>
                    {i < LEARNING_PATH.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 16, background: 'rgba(65,73,63,0.2)', marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < LEARNING_PATH.length - 1 ? 12 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: step.status === 'in_progress' ? 600 : 500, color: step.status === 'locked' ? '#41493f' : '#e3e0f7', marginBottom: 3 }}>{step.title}</div>
                    <div style={{ fontSize: 11, color: '#41493f' }}>{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
