'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { LiquidRendererService } from '@/application/services/LiquidRendererService';
import { DEFAULT_VARIABLES } from '@/presentation/constants/defaultProjects';
import { updateComponent } from '@/lib/actions/components';
import { CustomizerPanel } from '@/presentation/components/preview/CustomizerPanel';
import { VariablesPanel } from '@/presentation/components/preview/VariablesPanel';
import type { VariableType } from '@/domain/value-objects/types';

const CodeEditor = dynamic(
  () => import('./CodeEditor').then(m => m.CodeEditor),
  { ssr: false },
);

const RENDERER = new LiquidRendererService();

function buildPreview(liquid: string, css: string, js: string, vars?: Record<string, string>): string {
  const rendered = RENDERER.render(liquid || '', vars ?? DEFAULT_VARIABLES.values);
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>${css}</style></head><body>${rendered}<script>${js}</script></body></html>`;
}

type FilePath = 'sections/generated-section.liquid' | 'snippets/generated-snippet.liquid' | 'assets/theme.css' | 'assets/theme.js';

const TREE = [
  { dir: 'Sections', files: [{ path: 'sections/generated-section.liquid' as FilePath, label: 'generated-section.liquid', badge: '{}', color: '#cba6f7' }] },
  { dir: 'Snippets', files: [{ path: 'snippets/generated-snippet.liquid' as FilePath, label: 'generated-snippet.liquid', badge: '{}', color: '#cba6f7' }] },
  { dir: 'Assets',   files: [
    { path: 'assets/theme.css' as FilePath, label: 'theme.css', badge: '#',  color: '#89b4fa' },
    { path: 'assets/theme.js'  as FilePath, label: 'theme.js',  badge: 'JS', color: '#f9e2af' },
  ]},
];

function getLang(path: FilePath): 'liquid-markup' | 'css' | 'js' {
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.js'))  return 'js';
  return 'liquid-markup';
}

export interface ComponentEditorModalProps {
  id:         string;
  name:       string;
  liquidCode: string;
  cssCode:    string;
  jsCode:     string;
  onClose:    () => void;
  onSaved?:   (updated: { liquidCode: string; cssCode: string; jsCode: string }) => void;
}

export function ComponentEditorModal({ id, name, liquidCode, cssCode, jsCode, onClose, onSaved }: ComponentEditorModalProps) {
  const [liquid, setLiquid] = useState(liquidCode);
  const [css,    setCss]    = useState(cssCode);
  const [js,     setJs]     = useState(jsCode);
  // snippet tab is read-only placeholder derived from liquid render tags
  const [snippet, setSnippet] = useState(() => {
    const matches = Array.from(liquidCode.matchAll(/\{%-?\s*render\s+['"]([^'"]+)['"]/g)).map(m => m[1]);
    return matches.length > 0
      ? `{% comment %}\nReferenced snippets:\n${matches.map(n => `- snippets/${n}.liquid`).join('\n')}\n{% endcomment %}\n`
      : `{% comment %}\nNo snippets referenced yet.\n{% endcomment %}\n`;
  });

  const [activePath, setActivePath] = useState<FilePath>('sections/generated-section.liquid');
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({ Sections: true, Snippets: true, Assets: true });
  const [customizerVars, setCustomizerVars] = useState<Record<string, string>>(DEFAULT_VARIABLES.values);
  const [varMeta, setVarMeta] = useState<Record<string, VariableType>>(DEFAULT_VARIABLES.meta);
  const [sidePanel, setSidePanel] = useState<null | 'settings' | 'variables'>(null);
  const [previewHtml, setPreviewHtml] = useState(() => buildPreview(liquidCode, cssCode, jsCode));
  const [saveStatus, setSaveStatus]   = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoRun, setAutoRun]         = useState(true);
  const [isPending, startTransition]  = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSettingChange(key: string, value: string) {
    setCustomizerVars(prev => {
      const next = { ...prev, [key]: value };
      setPreviewHtml(buildPreview(liquid, css, js, next));
      return next;
    });
  }

  // Auto-run
  useEffect(() => {
    if (!autoRun) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewHtml(buildPreview(liquid, css, js, customizerVars));
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [liquid, css, js, autoRun]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync snippet references when liquid changes
  useEffect(() => {
    const matches = Array.from(liquid.matchAll(/\{%-?\s*render\s+['"]([^'"]+)['"]/g)).map(m => m[1]);
    if (matches.length > 0) {
      setSnippet(`{% comment %}\nReferenced snippets:\n${matches.map(n => `- snippets/${n}.liquid`).join('\n')}\n{% endcomment %}\n`);
    }
  }, [liquid]);

  function getCode(path: FilePath): string {
    if (path === 'sections/generated-section.liquid') return liquid;
    if (path === 'assets/theme.css')  return css;
    if (path === 'assets/theme.js')   return js;
    return snippet;
  }

  function setCode(path: FilePath, val: string) {
    if (path === 'sections/generated-section.liquid') setLiquid(val);
    else if (path === 'assets/theme.css')  setCss(val);
    else if (path === 'assets/theme.js')   setJs(val);
    else setSnippet(val);
  }

  function handleSave() {
    setSaveStatus('saving');
    startTransition(async () => {
      try {
        await updateComponent(id, { liquidCode: liquid, cssCode: css, jsCode: js });
        setSaveStatus('saved');
        onSaved?.({ liquidCode: liquid, cssCode: css, jsCode: js });
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    });
  }

  const lang = getLang(activePath);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 800 }} />
      <div style={{
        position: 'fixed', inset: 20, zIndex: 801,
        background: '#121221', border: '1px solid rgba(65,73,63,0.2)',
        borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ height: 56, borderBottom: '1px solid rgba(65,73,63,0.12)', background: '#0f0f1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e3e0f7', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#8b9387' }}>Edit code — preview updates automatically</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b9387', fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRun}
                onChange={e => setAutoRun(e.target.checked)}
                style={{ accentColor: '#c5ffbf' }}
              />
              Auto-run
            </label>
            <button
              onClick={() => setSidePanel(p => p === 'settings' ? null : 'settings')}
              style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${sidePanel === 'settings' ? 'rgba(197,255,191,0.3)' : 'rgba(65,73,63,0.2)'}`, background: sidePanel === 'settings' ? 'rgba(197,255,191,0.08)' : '#292839', color: sidePanel === 'settings' ? '#c5ffbf' : '#8b9387', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              ⚙ Settings
            </button>
            <button
              onClick={() => setSidePanel(p => p === 'variables' ? null : 'variables')}
              style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${sidePanel === 'variables' ? 'rgba(203,166,247,0.4)' : 'rgba(65,73,63,0.2)'}`, background: sidePanel === 'variables' ? 'rgba(203,166,247,0.12)' : '#292839', color: sidePanel === 'variables' ? '#cba6f7' : '#8b9387', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              {'{{ }}'} Variables
            </button>
            <button
              onClick={() => setPreviewHtml(buildPreview(liquid, css, js, customizerVars))}
              style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              ▶ Run
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || saveStatus === 'saving'}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', background: '#292839', color: '#c1c9bc', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving...' : saveStatus === 'error' ? 'Error' : 'Save'}
            </button>
            <button
              onClick={onClose}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', background: '#333344', color: '#e3e0f7', fontSize: 12, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* File tree */}
          <div style={{ width: 220, borderRight: '1px solid rgba(65,73,63,0.12)', background: '#111120', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '10px 14px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#41493f', borderBottom: '1px solid rgba(65,73,63,0.1)' }}>
              Explorer
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {TREE.map(group => (
                <div key={group.dir}>
                  <button
                    onClick={() => setExpandedDirs(prev => ({ ...prev, [group.dir]: !prev[group.dir] }))}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'transparent', border: 'none', color: '#c1c9bc', fontSize: 12, fontWeight: 500, textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: 9, color: '#41493f', transform: expandedDirs[group.dir] ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>▶</span>
                    {group.dir}
                  </button>
                  {expandedDirs[group.dir] && group.files.map(file => {
                    const active = activePath === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => setActivePath(file.path)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 7,
                          padding: '4px 14px 4px 26px', border: 'none', textAlign: 'left', cursor: 'pointer',
                          background: active ? 'rgba(203,166,247,0.1)' : 'transparent',
                          borderLeft: active ? '2px solid rgba(203,166,247,0.6)' : '2px solid transparent',
                        }}
                      >
                        <span style={{ fontSize: 9, fontWeight: 800, color: file.color, fontFamily: 'monospace' }}>{file.badge}</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', color: active ? '#d8c4ff' : '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {file.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Code editor */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(65,73,63,0.12)' }}>
            <div style={{ height: 40, borderBottom: '1px solid rgba(65,73,63,0.12)', background: '#0f0f1e', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#c1c9bc' }}>{activePath}</span>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <CodeEditor
                key={activePath}
                lang={lang}
                value={getCode(activePath)}
                onChange={val => setCode(activePath, val)}
                isDark
              />
            </div>
          </div>

          {/* Preview + Customizer */}
          <div style={{ width: '45%', minWidth: 380, background: '#0d0d1c', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 40, borderBottom: '1px solid rgba(65,73,63,0.12)', background: '#0f0f1e', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c5ffbf', display: 'inline-block', marginRight: 8 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b9387' }}>Live Preview</span>
            </div>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <iframe
                  srcDoc={previewHtml}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fff' }}
                  sandbox="allow-scripts"
                  title="Component Preview"
                />
              </div>
              {sidePanel === 'settings' && (
                <CustomizerPanel
                  liquidCode={liquid}
                  currentVars={customizerVars}
                  onSettingChange={handleSettingChange}
                />
              )}
              {sidePanel === 'variables' && (
                <VariablesPanel
                  variables={{ values: customizerVars, meta: varMeta }}
                  onSetVariable={(key, val) => {
                    setCustomizerVars(prev => {
                      const next = { ...prev, [key]: val };
                      setPreviewHtml(buildPreview(liquid, css, js, next));
                      return next;
                    });
                  }}
                  onAddVariable={(key, type) => {
                    setCustomizerVars(prev => ({ ...prev, [key]: '' }));
                    setVarMeta(prev => ({ ...prev, [key]: type }));
                  }}
                  onDeleteVariable={key => {
                    setCustomizerVars(prev => { const n = { ...prev }; delete n[key]; return n; });
                    setVarMeta(prev => { const n = { ...prev }; delete n[key]; return n; });
                  }}
                  onToggleType={key => {
                    setVarMeta(prev => ({ ...prev, [key]: prev[key] === 'media' ? 'text' : 'media' }));
                    setCustomizerVars(prev => ({ ...prev, [key]: '' }));
                  }}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
