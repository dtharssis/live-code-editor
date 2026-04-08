'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { deleteComponent } from '@/lib/actions/components';
import { useRouter } from 'next/navigation';
import { ComponentEditorModal } from '@/presentation/components/editor/ComponentEditorModal';
import { C, R, F, card, btnPrimary, badgeAI, badgeManual, sectionLabel } from '@/presentation/constants/tokens';
import { promoteComponent } from '@/lib/actions/components';

type Draft = {
  id:         string;
  name:       string;
  date:       string;
  updatedAt:  string;
  method:     string;
  stack:      string;
  liquidCode: string;
  cssCode:    string;
  jsCode:     string;
};

function continueWithAI(draft: Draft) {
  const payload = {
    liquid: draft.liquidCode,
    css:    draft.cssCode,
    js:     draft.jsCode,
    name:   draft.name,
    fromAI: draft.method === 'AI_GENERATED',
  };
  window.sessionStorage.setItem('livecode:ai-continue', JSON.stringify(payload));
  window.location.href = '/ai-builder?continue=1';
}

type Filter = 'All' | 'Manual' | 'AI-Generated';

export function DraftsClient({ drafts: initial }: { drafts: Draft[] }) {
  const router              = useRouter();
  const [filter, setFilter] = useState<Filter>('All');
  const [drafts, setDrafts] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Draft | null>(null);

  const filtered = drafts.filter(d => {
    if (filter === 'Manual')       return d.method === 'MANUAL';
    if (filter === 'AI-Generated') return d.method === 'AI_GENERATED';
    return true;
  });

  function handleDelete(id: string) {
    setDrafts(prev => prev.filter(d => d.id !== id));
    startTransition(async () => {
      try {
        await deleteComponent(id);
        router.refresh();
      } catch {
        setDrafts(initial);
      }
    });
  }

  function handleSaved(id: string, updated: { liquidCode: string; cssCode: string; jsCode: string }) {
    setDrafts(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
  }

  function handlePromote(id: string) {
    setDrafts(prev => prev.filter(d => d.id !== id));
    startTransition(async () => {
      try { await promoteComponent(id); router.refresh(); }
      catch { setDrafts(initial); }
    });
  }

  const recent = [...drafts].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: C.bgElevated, borderRadius: R.lg, padding: 4, width: 'fit-content' }}>
        {(['All', 'Manual', 'AI-Generated'] as Filter[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 18px', borderRadius: R.md, border: 'none', cursor: 'pointer', fontSize: F.base, fontWeight: 500,
              background: filter === tab ? C.bgActive : 'transparent',
              color: filter === tab ? C.textPrimary : C.textMuted,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Draft grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.2 }}>◫</div>
          <div style={{ fontSize: F.md, color: C.textDisabled, marginBottom: 12 }}>No components yet.</div>
          <Link href="/editor" style={{ fontSize: F.md, color: C.accentGreen, textDecoration: 'none', fontWeight: 600 }}>
            Create your first →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, marginBottom: 36 }}>
          {filtered.map(draft => (
            <div key={draft.id} style={{ ...card, overflow: 'hidden' }}>
              <div style={{ height: 120, background: C.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 32, opacity: 0.2 }}>◫</div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily: F.mono, fontSize: F.base, fontWeight: 600, color: C.textPrimary, lineHeight: 1.4, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {draft.name}
                  </div>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    disabled={isPending}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textDisabled, fontSize: F.md, padding: '0 4px', marginLeft: 4 }}
                    title="Delete"
                  >✕</button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={draft.method === 'AI_GENERATED' ? badgeAI : badgeManual}>
                    {draft.method === 'AI_GENERATED' ? 'AI Builder' : 'Manual'}
                  </span>
                  <span style={{ fontSize: F.xs, color: C.textMuted, padding: '2px 8px', background: C.bgBase, borderRadius: R.sm, fontFamily: F.mono }}>{draft.stack}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: F.sm, color: C.textDisabled }}>{draft.date}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setEditing(draft)}
                      style={{ fontSize: F.sm, fontWeight: 600, color: C.accentPurple, background: C.manualBg, border: `1px solid rgba(197,196,220,0.1)`, borderRadius: R.sm, padding: '4px 10px', cursor: 'pointer' }}
                      title="Edit code manually"
                    >
                      {'</>'} Edit
                    </button>
                    <button
                      onClick={() => continueWithAI(draft)}
                      style={{ fontSize: F.sm, fontWeight: 600, color: C.accentGreenDim, background: C.aiBg, border: `1px solid rgba(197,255,191,0.1)`, borderRadius: R.sm, padding: '4px 10px', cursor: 'pointer' }}
                      title="Continue building with AI"
                    >
                      ✦ AI
                    </button>
                    <button
                      onClick={() => handlePromote(draft.id)}
                      disabled={isPending}
                      style={{ fontSize: F.sm, fontWeight: 700, color: C.onAccent, background: `linear-gradient(135deg,${C.accentGreen},${C.accentGreenMd})`, border: 'none', borderRadius: R.sm, padding: '4px 10px', cursor: 'pointer' }}
                      title="Save as definitive"
                    >
                      ✓ Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border1}` }}>
          <h3 style={{ fontFamily: F.display, fontWeight: 700, fontSize: F['2xl'], margin: 0, color: C.textPrimary }}>Recent Activity</h3>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: '24px 20px', fontSize: F.md, color: C.textDisabled, textAlign: 'center' }}>No activity yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Draft Name', 'Updated', 'Method', 'Actions'].map(h => (
                  <th key={h} style={{ ...sectionLabel, padding: '10px 20px', textAlign: 'left', borderBottom: `1px solid ${C.border1}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(row => (
                <tr key={row.id}>
                  <td style={{ padding: '12px 20px', fontSize: F.md, fontFamily: F.mono, color: C.textPrimary }}>{row.name}</td>
                  <td style={{ padding: '12px 20px', fontSize: F.base, color: C.textMuted }}>{row.date}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={row.method === 'AI_GENERATED' ? badgeAI : badgeManual}>
                      {row.method === 'AI_GENERATED' ? 'AI Assist' : 'Manual'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => setEditing(row)}
                        style={{ fontSize: F.sm, fontWeight: 600, color: C.accentPurple, background: C.manualBg, border: `1px solid rgba(197,196,220,0.15)`, borderRadius: R.sm, padding: '5px 10px', cursor: 'pointer' }}
                        title="Edit code manually"
                      >
                        {'</>'} Edit
                      </button>
                      <button
                        onClick={() => continueWithAI(row)}
                        style={{ fontSize: F.sm, fontWeight: 600, color: C.accentGreenDim, background: C.aiBg, border: `1px solid rgba(197,255,191,0.1)`, borderRadius: R.sm, padding: '5px 10px', cursor: 'pointer' }}
                        title="Continue with AI Builder"
                      >
                        ✦ AI
                      </button>
                      <button
                        onClick={() => handlePromote(row.id)}
                        disabled={isPending}
                        style={{ fontSize: F.sm, fontWeight: 700, color: C.onAccent, background: `linear-gradient(135deg,${C.accentGreen},${C.accentGreenMd})`, borderRadius: R.sm, padding: '5px 10px', border: 'none', cursor: 'pointer' }}
                        title="Save as definitive"
                      >
                        ✓ Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
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
    </>
  );
}
