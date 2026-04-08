'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ComponentEditorModal } from '@/presentation/components/editor/ComponentEditorModal';
import { C, R, F } from '@/presentation/constants/tokens';

type ActivityItem = {
  id:         string;
  name:       string;
  method:     string;
  timeAgo:    string;
  liquidCode: string;
  cssCode:    string;
  jsCode:     string;
};

export function RecentActivityClient({ items }: { items: ActivityItem[] }) {
  const [editing, setEditing] = useState<ActivityItem | null>(null);

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◫</div>
        <div style={{ fontSize: F.md, color: C.textDisabled }}>No components yet.</div>
        <Link href="/editor" style={{ display: 'inline-block', marginTop: 12, fontSize: F.base, color: C.accentGreen, textDecoration: 'none', fontWeight: 600 }}>
          Create your first →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < items.length - 1 ? `1px solid ${C.border1}` : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: R.lg, background: item.method === 'AI_GENERATED' ? C.aiBg : C.manualBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: F.md, flexShrink: 0 }}>
              <span style={{ color: item.method === 'AI_GENERATED' ? C.accentGreen : C.accentPurple }}>
                {item.method === 'AI_GENERATED' ? '✦' : '</>'}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: F.md, fontWeight: 500, color: C.textPrimary, fontFamily: F.mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
              <div style={{ fontSize: F.sm, color: C.textMuted, marginTop: 2 }}>{item.timeAgo} · {item.method === 'AI_GENERATED' ? 'AI Builder' : 'Manual'}</div>
            </div>
            <button
              onClick={() => setEditing(item)}
              style={{ padding: '5px 8px', borderRadius: R.sm, border: `1px solid ${C.border3}`, background: 'transparent', color: C.textMuted, cursor: 'pointer', fontSize: F.sm }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <ComponentEditorModal
          id={editing.id}
          name={editing.name}
          liquidCode={editing.liquidCode}
          cssCode={editing.cssCode}
          jsCode={editing.jsCode}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
