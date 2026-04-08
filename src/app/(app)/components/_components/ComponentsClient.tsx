'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteComponent, demoteComponent } from '@/lib/actions/components';
import { ComponentEditorModal } from '@/presentation/components/editor/ComponentEditorModal';
import { C, R, F, card, btnPrimary, badgeAI, badgeManual, sectionLabel } from '@/presentation/constants/tokens';
import { DEFAULT_FILES } from '@/presentation/constants/defaultProjects';

type Item = {
  id:         string;
  name:       string;
  date:       string;
  updatedAt:  string;
  method:     string;
  liquidCode: string;
  cssCode:    string;
  jsCode:     string;
};

// Example component always shown first
const EXAMPLE_ITEM: Item = {
  id:         '__example__',
  name:       'Product Card (Example)',
  date:       'Built-in',
  updatedAt:  new Date(0).toISOString(),
  method:     'MANUAL',
  liquidCode: DEFAULT_FILES['dynamic-hero.liquid'] ?? '',
  cssCode:    DEFAULT_FILES['theme.css'] ?? '',
  jsCode:     DEFAULT_FILES['theme.js'] ?? '',
};

function continueWithAI(item: Item) {
  const payload = { liquid: item.liquidCode, css: item.cssCode, js: item.jsCode, name: item.name, fromAI: item.method === 'AI_GENERATED' };
  window.sessionStorage.setItem('livecode:ai-continue', JSON.stringify(payload));
  window.location.href = '/ai-builder?continue=1';
}

export function ComponentsClient({ items: initial }: { items: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing]   = useState<Item | null>(null);
  const [shareId, setShareId]   = useState<string | null>(null);

  const all = [EXAMPLE_ITEM, ...items];

  function handleDelete(id: string) {
    if (id === '__example__') return;
    setItems(prev => prev.filter(i => i.id !== id));
    startTransition(async () => {
      try { await deleteComponent(id); router.refresh(); }
      catch { setItems(initial); }
    });
  }

  function handleMoveToDraft(id: string) {
    if (id === '__example__') return;
    setItems(prev => prev.filter(i => i.id !== id));
    startTransition(async () => {
      try { await demoteComponent(id); router.refresh(); }
      catch { setItems(initial); }
    });
  }

  function handleSaved(id: string, updated: { liquidCode: string; cssCode: string; jsCode: string }) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
  }

  const shareUrl = shareId && shareId !== '__example__'
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareId}`
    : null;

  return (
    <>
      {/* Grid */}
      {all.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>◫</div>
          <div style={{ fontSize: F.md, color: C.textDisabled, marginBottom: 12 }}>No saved components yet.</div>
          <div style={{ fontSize: F.base, color: C.textMuted }}>Save a draft as definitive to see it here.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20, marginBottom: 40 }}>
          {all.map(item => {
            const isExample = item.id === '__example__';
            return (
              <div key={item.id} style={{ ...card, overflow: 'hidden', position: 'relative' }}>
                {/* Saved badge */}
                <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, display: 'flex', gap: 6 }}>
                  {isExample ? (
                    <span style={{ fontSize: F.xs, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: R.sm, background: 'rgba(202,211,241,0.12)', color: C.accentPurple }}>Example</span>
                  ) : (
                    <span style={{ fontSize: F.xs, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: R.sm, background: 'rgba(197,255,191,0.12)', color: C.accentGreen }}>● Saved</span>
                  )}
                </div>

                {/* Thumbnail */}
                <div style={{ height: 120, background: C.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 32, opacity: 0.15 }}>◫</div>
                </div>

                {/* Info */}
                <div style={{ padding: 16 }}>
                  <div style={{ fontFamily: F.mono, fontSize: F.base, fontWeight: 600, color: C.textPrimary, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={item.method === 'AI_GENERATED' ? badgeAI : badgeManual}>
                      {item.method === 'AI_GENERATED' ? 'AI Builder' : 'Manual'}
                    </span>
                    {!isExample && (
                      <span style={{ fontSize: F.xs, color: C.textDisabled }}>{item.date}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setEditing(item)}
                      style={{ fontSize: F.sm, fontWeight: 600, color: C.accentPurple, background: C.manualBg, border: `1px solid rgba(197,196,220,0.1)`, borderRadius: R.sm, padding: '4px 10px', cursor: 'pointer' }}
                    >
                      {'</>'} Edit
                    </button>
                    <button
                      onClick={() => continueWithAI(item)}
                      style={{ fontSize: F.sm, fontWeight: 600, color: C.accentGreenDim, background: C.aiBg, border: `1px solid rgba(197,255,191,0.1)`, borderRadius: R.sm, padding: '4px 10px', cursor: 'pointer' }}
                    >
                      ✦ AI
                    </button>
                    {/* Share — only saved non-example */}
                    {!isExample && (
                      <button
                        onClick={() => setShareId(item.id)}
                        style={{ fontSize: F.sm, fontWeight: 600, color: C.accentBlue, background: 'rgba(137,180,250,0.08)', border: `1px solid rgba(137,180,250,0.15)`, borderRadius: R.sm, padding: '4px 10px', cursor: 'pointer' }}
                      >
                        ↗ Share
                      </button>
                    )}
                    {/* Move to draft */}
                    {!isExample && (
                      <button
                        onClick={() => handleMoveToDraft(item.id)}
                        disabled={isPending}
                        style={{ fontSize: F.sm, color: C.textDisabled, background: 'transparent', border: `1px solid ${C.border2}`, borderRadius: R.sm, padding: '4px 10px', cursor: 'pointer' }}
                        title="Move back to Draft"
                      >
                        ↩ Draft
                      </button>
                    )}
                    {!isExample && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        style={{ fontSize: F.sm, color: C.textDisabled, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
                        title="Delete"
                      >✕</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share modal */}
      {shareUrl && (
        <>
          <div onClick={() => setShareId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 999, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1000, width: 480, background: C.bgSurface, border: `1px solid ${C.border3}`, borderRadius: 16, padding: '28px 28px 24px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: F['2xl'], color: C.textPrimary, marginBottom: 6 }}>Share Component</div>
            <p style={{ fontSize: F.base, color: C.textMuted, marginBottom: 20 }}>Anyone with this link can view the component.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                readOnly
                value={shareUrl}
                style={{ flex: 1, background: C.bgBase, border: `1px solid ${C.border3}`, borderRadius: R.md, padding: '9px 12px', color: C.textPrimary, fontSize: F.base, fontFamily: F.mono, outline: 'none' }}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                style={{ ...btnPrimary, cursor: 'pointer', flexShrink: 0 }}
              >
                Copy
              </button>
            </div>
            <button onClick={() => setShareId(null)} style={{ marginTop: 16, fontSize: F.base, color: C.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </>
      )}

      {editing && editing.id !== '__example__' && (
        <ComponentEditorModal
          id={editing.id}
          name={editing.name}
          liquidCode={editing.liquidCode}
          cssCode={editing.cssCode}
          jsCode={editing.jsCode}
          onClose={() => setEditing(null)}
          onSaved={updated => handleSaved(editing.id, updated)}
        />
      )}
      {editing && editing.id === '__example__' && (
        <ComponentEditorModal
          id="__example__"
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
