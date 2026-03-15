'use client';

import dynamic from 'next/dynamic';
import { useStore } from '../../store';
import { useResize } from '../../hooks/useResize';
import { Badge } from '../ui/Badge';
import { cn } from '../../../lib/cn';
import { PaneId } from '../../../domain/value-objects/types';

const CodeEditor = dynamic(
  () => import('./CodeEditor').then(m => m.CodeEditor),
  { ssr: false },
);

interface EditorPanelProps {
  totalWidth:  number;
  totalHeight: number;
  isDark:      boolean;
}

interface PaneConfig {
  id:        PaneId;
  badgeVariant: 'html' | 'css' | 'js' | 'liquid';
  label:     string;
  subtitle:  string;
  lang:      'markup' | 'liquid-markup' | 'css' | 'js';
}

export function EditorPanel({ totalWidth, totalHeight, isDark }: EditorPanelProps) {
  const mode         = useStore(s => s.mode);
  const projects     = useStore(s => s.projects);
  const updateCode   = useStore(s => s.updateCode);
  const expandedPane = useStore(s => s.expandedPane);
  const setExpanded  = useStore(s => s.setExpandedPane);
  const openModal    = useStore(s => s.openModal);

  const { state, onVMouseDown, onHMouseDown } = useResize(totalWidth, totalHeight);
  const { editorWidth, paneHeights } = state;

  const isLiquid = mode === 'liquid';

  const panes: PaneConfig[] = [
    {
      id: 'markup',
      badgeVariant: isLiquid ? 'liquid' : 'html',
      label:    isLiquid ? 'Liquid' : 'HTML',
      subtitle: isLiquid ? 'Shopify Components' : 'Structure',
      lang:     isLiquid ? 'liquid-markup' : 'markup',
    },
    { id: 'css', badgeVariant: 'css',  label: 'CSS',        subtitle: 'Styles', lang: 'css' },
    { id: 'js',  badgeVariant: 'js',   label: 'JS',         subtitle: isLiquid ? 'Section JS' : 'Logic', lang: 'js' },
  ];

  const getPaneHeight = (idx: number): number => {
    if (expandedPane) {
      const paneId = panes[idx].id;
      if (paneId === expandedPane) return totalHeight - 8;
      return 0;
    }
    return paneHeights[idx] || Math.floor((totalHeight - 8) / 3);
  };

  return (
    <div
      className="flex flex-shrink-0 h-full max-md:w-full"
      style={{ width: editorWidth || '50%' }}
    >
      {/* Mobile tabs */}
      <MobileTabs isLiquid={isLiquid} onOpenVars={() => openModal('variables')} />

      {/* Editor column */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 h-full">
        {panes.map((pane, idx) => {
          const isExpanded  = expandedPane === pane.id;
          const isCollapsed = expandedPane !== null && !isExpanded;
          const height = getPaneHeight(idx);

          return (
            <div key={pane.id}>
              {/* Horizontal divider before pane 1 and 2 */}
              {idx > 0 && (
                <div
                  onMouseDown={e => onHMouseDown(e, (idx - 1) as 0 | 1, idx as 1 | 2)}
                  className="hidden md:block h-1 bg-[var(--divbg)] cursor-row-resize flex-shrink-0 hover:bg-[var(--divhover)] transition-colors"
                />
              )}

              {/* Pane */}
              <div
                className={cn(
                  'flex flex-col overflow-hidden',
                  'max-md:flex-1 max-md:hidden',
                  isCollapsed && 'max-h-[36px]',
                )}
                style={
                  typeof window !== 'undefined' && window.innerWidth > 768
                    ? { height: isCollapsed ? 36 : height, flexShrink: 0 }
                    : {}
                }
                data-mob-pane={pane.id}
              >
                {/* Pane header */}
                <div
                  className="flex items-center gap-2 px-3 py-[5px] bg-[var(--surface2)] border-b border-[var(--border)] flex-shrink-0 cursor-pointer select-none"
                  onClick={() => setExpanded(isExpanded ? null : pane.id)}
                >
                  <Badge variant={pane.badgeVariant}>{pane.label}</Badge>
                  <span className="text-[11px] text-[var(--text2)]">{pane.subtitle}</span>

                  {/* Variables button (Liquid mode, markup pane) */}
                  {isLiquid && pane.id === 'markup' && (
                    <button
                      onClick={e => { e.stopPropagation(); openModal('variables'); }}
                      className="hidden md:block text-[10px] font-semibold px-[9px] py-[2px] rounded border border-[rgba(203,166,247,0.3)] bg-[rgba(203,166,247,0.1)] text-[var(--tag-l)] cursor-pointer hover:bg-[rgba(203,166,247,0.2)]"
                    >
                      {'{{ }} Variables'}
                    </button>
                  )}

                  <button
                    onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : pane.id); }}
                    className="ml-auto bg-transparent border-none text-[var(--text2)] cursor-pointer px-[6px] py-[2px] text-[12px] rounded hover:text-[var(--text)] hover:bg-[var(--surface)] flex-shrink-0"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? '⇲' : '⛶'}
                  </button>
                </div>

                {/* Editor */}
                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden min-h-0">
                    <CodeEditor
                      lang={pane.lang}
                      value={projects[mode][pane.id]}
                      onChange={val => updateCode(pane.id, val)}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vertical resize divider */}
      <div
        onMouseDown={onVMouseDown}
        className="hidden md:block w-1 bg-[var(--divbg)] cursor-col-resize flex-shrink-0 z-[1] hover:bg-[var(--divhover)] transition-colors"
      />
    </div>
  );
}

// ── Mobile tabs sub-component ──────────────────────────────────────────────

function MobileTabs({ isLiquid, onOpenVars }: { isLiquid: boolean; onOpenVars: () => void }) {
  const mobileTab  = useStore(s => s.mobileTab);
  const setTab     = useStore(s => s.setMobileTab);

  const tabs = [
    { key: 'markup' as const, label: isLiquid ? 'Liquid' : 'HTML', activeClass: isLiquid ? 'text-[var(--tag-l)] border-b-[var(--tag-l)]' : 'text-[var(--tag-h)] border-b-[var(--tag-h)]' },
    { key: 'css'    as const, label: 'CSS',                         activeClass: 'text-[var(--tag-c)] border-b-[var(--tag-c)]' },
    { key: 'js'     as const, label: 'JS',                          activeClass: 'text-[var(--tag-j)] border-b-[var(--tag-j)]' },
    { key: 'preview' as const, label: 'Preview',                    activeClass: 'text-[var(--green)] border-b-[var(--green)]' },
  ];

  return (
    <div className="md:hidden flex bg-[var(--bg2)] border-b border-[var(--border)] flex-shrink-0 overflow-x-auto scrollbar-none absolute top-0 left-0 right-0 z-10">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={cn(
            'flex-1 min-w-[64px] py-2 px-1 text-[11px] font-semibold text-center border-b-2 border-transparent bg-transparent cursor-pointer',
            mobileTab === t.key ? t.activeClass : 'text-[var(--text2)]',
          )}
        >
          {t.label}
        </button>
      ))}
      {isLiquid && (
        <button
          onClick={onOpenVars}
          className="flex-1 min-w-[72px] py-2 px-1 text-[11px] font-semibold text-center border-b-2 border-transparent bg-transparent cursor-pointer text-[var(--tag-l)]"
        >
          {'{{ }}'}
        </button>
      )}
    </div>
  );
}
