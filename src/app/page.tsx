import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#121221', color: '#e3e0f7', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, height: 64,
        background: 'rgba(18,18,33,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(65,73,63,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <span style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 22, color: '#a6e3a1' }}>
            Live Code
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/login" style={{
            fontSize: 12, fontWeight: 700, textDecoration: 'none',
            background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)',
            color: '#00390c',
            padding: '8px 20px', borderRadius: 8,
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: 760, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(197,255,191,0.04)', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(202,211,241,0.04)', filter: 'blur(100px)', pointerEvents: 'none' }} />

        {/* Headline */}
        <h1 style={{ margin: '0 0 24px', lineHeight: 0.9, letterSpacing: '-0.03em' }}>
          <span style={{ display: 'block', fontSize: 'clamp(48px,8vw,96px)', fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, color: '#e3e0f7' }}>
            The ultimate Shopify
          </span>
          <span style={{ display: 'block', fontSize: 'clamp(48px,8vw,96px)', fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Liquid component
          </span>
          <span style={{ display: 'block', fontSize: 'clamp(48px,8vw,96px)', fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, color: '#e3e0f7' }}>
            builder
          </span>
        </h1>

        <p style={{ fontSize: 18, color: '#c1c9bc', fontWeight: 300, lineHeight: 1.7, maxWidth: 640, margin: '0 0 40px' }}>
          Craft high-performance, modular theme components with a visual architecture designed for Shopify engineers. One environment, total control.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <Link href="/login" style={{
            background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)',
            color: '#00390c', fontFamily: 'Space Grotesk, system-ui, sans-serif',
            fontWeight: 700, fontSize: 18, textDecoration: 'none',
            padding: '18px 40px', borderRadius: 12,
            boxShadow: '0 20px 40px -10px rgba(166,227,161,0.15)',
            transition: 'transform 0.15s',
          }}>
            Get Started
          </Link>
          <Link href="/how-it-works" style={{
            background: 'rgba(51,51,68,0.8)', backdropFilter: 'blur(20px)',
            color: '#e3e0f7', fontFamily: 'Space Grotesk, system-ui, sans-serif',
            fontWeight: 700, fontSize: 18, textDecoration: 'none',
            padding: '18px 40px', borderRadius: 12,
            border: '1px solid rgba(65,73,63,0.25)',
            transition: 'background 0.15s',
          }}>
            View Demo
          </Link>
        </div>

        {/* Editor preview inlay */}
        <div style={{
          width: '100%', maxWidth: 900,
          background: '#121221', borderRadius: 14,
          border: '1px solid rgba(65,73,63,0.15)',
          overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
        }}>
          {/* Top bar */}
          <div style={{ height: 56, padding: '0 16px', borderBottom: '1px solid rgba(65,73,63,0.12)', background: 'rgba(13,13,28,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e3e0f7' }}>Editor</div>
              <div style={{ fontSize: 10, color: '#8b9387' }}>Build and preview Shopify components</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#8b9387' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, border: '1px solid rgba(197,255,191,0.3)', background: 'transparent' }} />
                Auto-run
              </div>
              <div style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', background: '#292839', color: '#c1c9bc', fontSize: 11, fontWeight: 600 }}>Save</div>
              <div style={{ padding: '5px 12px', borderRadius: 8, background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontSize: 11, fontWeight: 700 }}>▶ Run</div>
            </div>
          </div>

          {/* Body: code + preview */}
          <div style={{ display: 'flex', height: 320 }}>

            {/* Code panel */}
            <div style={{ width: '42%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(65,73,63,0.12)' }}>
              {/* Tab bar */}
              <div style={{ height: 40, background: '#0f0f1e', borderBottom: '1px solid rgba(65,73,63,0.12)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: '6px 6px 0 0', background: '#1a1a2a', border: '1px solid rgba(65,73,63,0.2)', borderBottom: 'none', marginBottom: -1 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#cba6f7', fontFamily: 'monospace' }}>{'{}'}</span>
                  <span style={{ fontSize: 11, color: '#c1c9bc', fontFamily: 'monospace' }}>dynamic-hero.liquid</span>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 5, border: '1px solid rgba(203,166,247,0.25)', background: 'rgba(203,166,247,0.08)', color: '#cba6f7' }}>{'{{ }} Variables'}</div>
              </div>
              {/* Code lines */}
              <div style={{ flex: 1, background: '#1e1e2e', padding: '14px 16px', overflow: 'hidden', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7 }}>
                {[
                  { indent: 0, color: '#cba6f7', text: "<section class=\"lc-section\">" },
                  { indent: 1, color: '#89b4fa', text: "{% if section.settings.show_badge %}" },
                  { indent: 2, color: '#a6e3a1', text: "<span class=\"lc-badge\">" },
                  { indent: 3, color: '#f9e2af', text: "{{ section.settings.badge_label }}" },
                  { indent: 2, color: '#a6e3a1', text: "</span>" },
                  { indent: 1, color: '#89b4fa', text: "{% endif %}" },
                  { indent: 1, color: '#cba6f7', text: "<div class=\"lc-body\">" },
                  { indent: 2, color: '#f9e2af', text: "{{ section.settings.product_title }}" },
                  { indent: 1, color: '#cba6f7', text: "</div>" },
                  { indent: 0, color: '#cba6f7', text: "</section>" },
                ].map((line, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: '#41493f', userSelect: 'none', minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
                    <span style={{ color: line.color, paddingLeft: line.indent * 14 }}>{line.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d0d1c' }}>
              {/* Preview toolbar */}
              <div style={{ height: 40, borderBottom: '1px solid rgba(65,73,63,0.12)', background: 'rgba(13,13,28,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c5ffbf', display: 'inline-block' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e3e0f7' }}>Live Preview</span>
                </div>
                <div style={{ display: 'flex', background: '#0d0d1c', borderRadius: 7, padding: 3, gap: 2 }}>
                  {['🖥', '📱', '📲'].map((icon, i) => (
                    <div key={i} style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, background: i === 0 ? '#333344' : 'transparent', color: i === 0 ? '#c5ffbf' : '#8b9387' }}>{icon}</div>
                  ))}
                </div>
              </div>
              {/* Fake component preview */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'hidden' }}>
                <div style={{ width: '100%', maxWidth: 260, background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  <div style={{ height: 130, background: 'linear-gradient(135deg,#e2e8f0,#edf2f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: 10, left: 10, background: '#e53935', color: '#fff', fontSize: 8, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 10 }}>New</span>
                    <svg viewBox="0 0 80 80" width="64" height="64" fill="none"><circle cx="40" cy="30" r="18" stroke="#cbd5e0" strokeWidth="2"/><rect x="20" y="52" width="40" height="20" rx="4" stroke="#cbd5e0" strokeWidth="2"/></svg>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Tissot</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a202c', marginBottom: 6, lineHeight: 1.3 }}>Tissot Gentleman Powermatic 80</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: '#aaa', textDecoration: 'line-through' }}>$695.00</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#e53935' }}>$595.00</span>
                    </div>
                    <div style={{ background: '#1a202c', color: '#fff', fontSize: 10, fontWeight: 600, textAlign: 'center', padding: '7px', borderRadius: 7 }}>Add to cart</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 'clamp(28px,4vw,40px)', letterSpacing: '-0.025em', margin: '0 0 16px', color: '#e3e0f7' }}>
            Engineered for Performance.
          </h2>
          <p style={{ color: '#c1c9bc', fontSize: 16, maxWidth: 560, margin: 0 }}>
            Deep integration with Shopify&apos;s architecture ensures your components are lightweight and lightning fast.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {/* Card 1 — large, spans 2 */}
          <div style={{ gridColumn: 'span 2', background: '#1a1a2a', borderRadius: 24, padding: 40, border: '1px solid rgba(65,73,63,0.12)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: 24, top: 24, fontSize: 140, color: 'rgba(197,255,191,0.06)', fontFamily: 'monospace', userSelect: 'none' }}>{ '{:}' }</div>
            <div style={{ width: 48, height: 48, background: 'rgba(166,227,161,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 20 }}>⬡</div>
            <h3 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 28, margin: '0 0 12px', color: '#e3e0f7' }}>Modular Architecture</h3>
            <p style={{ color: '#c1c9bc', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>Build once, deploy everywhere. Our system enforces a strict atomic design principle for Shopify Liquid.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Atomic CSS integration with Tailwind support', 'Reusable snippet libraries across stores'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#c1c9bc' }}>
                  <span style={{ color: '#c5ffbf', fontSize: 16 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ background: '#292839', borderRadius: 24, padding: 40, border: '1px solid rgba(65,73,63,0.12)' }}>
            <div style={{ width: 48, height: 48, background: 'rgba(202,211,241,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 20 }}>⊞</div>
            <h3 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 22, margin: '0 0 12px', color: '#e3e0f7' }}>Section & Snippet Support</h3>
            <p style={{ color: '#c1c9bc', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>Native support for schema-powered sections and logic-heavy snippets. The bridge between JSON and Liquid.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['L', 'J', 'T'].map(l => (
                <div key={l} style={{ width: 32, height: 32, borderRadius: '50%', background: '#383849', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#e3e0f7', border: '2px solid #121221' }}>{l}</div>
              ))}
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ background: 'rgba(51,51,68,0.5)', borderRadius: 24, padding: 32, border: '1px solid rgba(65,73,63,0.12)' }}>
            <div style={{ width: 40, height: 40, background: 'rgba(197,255,191,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 16 }}>⌨</div>
            <h4 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 18, margin: '0 0 8px', color: '#e3e0f7' }}>CLI Ready</h4>
            <p style={{ color: '#c1c9bc', fontSize: 14, lineHeight: 1.5, margin: 0 }}>Push directly to your Shopify Theme via Live Code CLI.</p>
          </div>

          {/* Card 4 — spans 2 */}
          <div style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg,#1a1a2a,#292839)', borderRadius: 24, padding: 32, border: '1px solid rgba(65,73,63,0.12)', display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#121221', border: '4px solid rgba(197,255,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>⇄</div>
            <div>
              <h3 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 22, margin: '0 0 10px', color: '#e3e0f7' }}>Direct Theme Integration</h3>
              <p style={{ color: '#c1c9bc', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>Stop manually copy-pasting Liquid files. Sync your entire project with your active Shopify theme in one click.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Live Sync Enabled', 'GitHub Webhooks'].map(tag => (
                  <span key={tag} style={{ background: '#1e1e2e', borderRadius: 999, padding: '4px 12px', fontSize: 10, fontFamily: 'monospace', color: '#c1c9bc' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(65,73,63,0.1)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 20, color: '#a6e3a1', marginBottom: 16 }}>Live Code</div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, maxWidth: 340 }}>
              Elevating Shopify Liquid development through Live Code UI and modular design patterns. Built by developers, for developers.
            </p>
          </div>
          {[
            { title: 'RESOURCES', links: ['API Reference', 'Changelog'] },
            { title: 'COMPANY', links: ['About Us', 'Blog', 'Twitter', 'GitHub'] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(65,73,63,0.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 10, color: '#374151', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>© {new Date().getFullYear()} Live Code. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <a key={l} href="#" style={{ fontSize: 10, color: '#374151', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
