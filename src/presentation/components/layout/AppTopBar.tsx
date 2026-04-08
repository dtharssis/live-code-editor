'use client';

import { C, R, F } from '@/presentation/constants/tokens';

export function AppTopBar() {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30, height: 64,
      background: `rgba(13,13,28,0.9)`, backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border1}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: F.md, color: C.textDisabled }}>⌕</span>
        <input
          type="search"
          placeholder="Search components or files..."
          style={{
            width: '100%', padding: '8px 12px 8px 36px',
            background: C.bgBase, border: `1px solid ${C.border3}`,
            borderRadius: R.lg, fontSize: F.md, color: C.textPrimary, outline: 'none',
            fontFamily: F.body,
          }}
        />
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: R.md, border: `1px solid ${C.border3}`,
          background: C.bgActive, color: C.accentGreenDim, fontSize: F.base, fontWeight: 500, cursor: 'pointer',
        }}>
          ↗ Share
        </button>
      </div>
    </header>
  );
}
