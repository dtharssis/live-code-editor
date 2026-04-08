'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { usePreview } from '../../hooks/usePreview';
import { ConsolePanel } from '../preview/ConsolePanel';
import { CustomizerPanel } from '../preview/CustomizerPanel';
import { VariablesPanel } from '../preview/VariablesPanel';
import { createComponent } from '@/lib/actions/components';
import type { ComponentEntity } from '@/domain/entities/Component';

const CodeEditor = dynamic(
  () => import('./CodeEditor').then(m => m.CodeEditor),
  { ssr: false },
);

interface EditorShellProps {
  userName?:    string;
  userImage?:   string | null;
  initialDraft?: ComponentEntity;
  isNew?:       boolean;
}

function getFileLang(filename: string): 'liquid-markup' | 'css' | 'js' {
  if (filename.endsWith('.liquid')) return 'liquid-markup';
  if (filename.endsWith('.css')) return 'css';
  return 'js';
}

function fileColor(name: string) {
  if (name.endsWith('.liquid')) return '#cba6f7';
  if (name.endsWith('.css')) return '#89b4fa';
  return '#f9e2af';
}

function fileLabel(name: string) {
  if (name.endsWith('.liquid')) return '{}';
  if (name.endsWith('.css')) return '#';
  return 'JS';
}

export function EditorShell({ userName = 'Developer', userImage = null, initialDraft, isNew }: EditorShellProps) {
  useTheme();

  const autoRun = useStore(s => s.autoRun);
  const setAutoRun = useStore(s => s.setAutoRun);
  const files = useStore(s => s.files);
  const variables = useStore(s => s.variables);
  const activeFile = useStore(s => s.activeFile);
  const setActiveFile = useStore(s => s.setActiveFile);
  const updateFileContent = useStore(s => s.updateFileContent);
  const setVariable       = useStore(s => s.setVariable);
  const addVariable       = useStore(s => s.addVariable);
  const deleteVariable    = useStore(s => s.deleteVariable);
  const toggleVariableType = useStore(s => s.toggleVariableType);
  const resetFiles = useStore(s => s.resetFiles);


  const [sidePanel, setSidePanel] = useState<null | 'settings' | 'variables'>(null);

  // Reset to blank when ?new=1
  useEffect(() => {
    if (isNew) {
      resetFiles();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const frameRef = useRef<HTMLIFrameElement>(null!);
  const { run } = usePreview(frameRef);

  const [isDark, setIsDark] = useState(true);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  const runRef = useRef(run);
  runRef.current = run;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRun = useCallback(() => {
    if (!autoRun) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runRef.current(), 600);
  }, [autoRun]);

  const prevKeyRef = useRef('');
  useEffect(() => {
    const key = JSON.stringify(files) + JSON.stringify(variables.values);
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key;
      scheduleRun();
    }
  }, [files, variables, scheduleRun]);

  useEffect(() => {
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load saved draft files into the store when coming from /drafts
  useEffect(() => {
    if (!initialDraft) return;
    updateFileContent('dynamic-hero.liquid', initialDraft.liquidCode);
    updateFileContent('theme.css', initialDraft.cssCode);
    updateFileContent('theme.js', initialDraft.jsCode);
    setActiveFile('dynamic-hero.liquid');
    setTimeout(() => run(), 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const raw = window.sessionStorage.getItem('livecode:editor-import');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { liquid?: string; css?: string; js?: string };
      if (typeof parsed.liquid === 'string') updateFileContent('dynamic-hero.liquid', parsed.liquid);
      if (typeof parsed.css === 'string') updateFileContent('theme.css', parsed.css);
      if (typeof parsed.js === 'string') updateFileContent('theme.js', parsed.js);
      setActiveFile('dynamic-hero.liquid');
      setTimeout(() => run(), 0);
    } catch {
      // ignore invalid import payload
    } finally {
      window.sessionStorage.removeItem('livecode:editor-import');
    }
  }, [run, setActiveFile, updateFileContent]);

  function handleSaveDraft() {
    const name = window.prompt('Component name:', 'Untitled Component');
    if (!name) return;

    setSaveStatus('saving');
    const markup = Object.entries(files).filter(([n]) => n.endsWith('.liquid')).map(([, c]) => c).join('\n');
    const css = Object.entries(files).filter(([n]) => n.endsWith('.css')).map(([, c]) => c).join('\n');
    const js = Object.entries(files).filter(([n]) => n.endsWith('.js')).map(([, c]) => c).join('\n');

    startTransition(async () => {
      try {
        await createComponent({ name, liquidCode: markup, cssCode: css, jsCode: js, method: 'MANUAL' });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    });
  }

  const lang = getFileLang(activeFile);
const previewWidth =
    previewViewport === 'desktop'
      ? '100%'
      : previewViewport === 'tablet'
        ? 'min(100%, 768px)'
        : 'min(100%, 390px)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px - 4rem)',
        minHeight: 'calc(100vh - 64px - 4rem)',
        maxHeight: 'calc(100vh - 64px - 4rem)',
        background: '#121221',
        border: '1px solid rgba(65,73,63,0.15)',
        borderRadius: 14,
        overflow: 'hidden',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
      }}
    >
      <div
        style={{
          height: 56,
          padding: '0 16px',
          borderBottom: '1px solid rgba(65,73,63,0.12)',
          background: 'rgba(13,13,28,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e3e0f7' }}>Editor</div>
          <div style={{ fontSize: 11, color: '#8b9387' }}>Build and preview Shopify components</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b9387', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={autoRun}
              onChange={e => setAutoRun(e.target.checked)}
              style={{ accentColor: '#c5ffbf' }}
            />
            Auto-run
          </label>
          <button
            onClick={handleSaveDraft}
            disabled={isPending || saveStatus === 'saving'}
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              border: '1px solid rgba(65,73,63,0.2)',
              background: '#292839',
              color: '#c1c9bc',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={run}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)',
              color: '#00390c',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ▶ Run
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <div
          style={{
            width: 'clamp(360px, 36vw, 520px)',
            maxWidth: '100%',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 40,
              borderBottom: '1px solid rgba(65,73,63,0.12)',
              background: '#0f0f1e',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: '6px 6px 0 0',
                background: '#1a1a2a',
                border: '1px solid rgba(65,73,63,0.2)',
                borderBottom: 'none',
                marginBottom: -1,
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, color: fileColor(activeFile), fontFamily: 'monospace' }}>
                {fileLabel(activeFile)}
              </span>
              <span style={{ fontSize: 12, color: '#c1c9bc', fontFamily: 'monospace' }}>{activeFile}</span>
            </div>

          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <CodeEditor
              key={activeFile}
              lang={lang}
              value={files[activeFile] ?? ''}
              onChange={val => updateFileContent(activeFile, val)}
              isDark={isDark}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            borderLeft: '1px solid rgba(65,73,63,0.12)',
            display: 'flex',
            flexDirection: 'column',
            background: '#0d0d1c',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 56,
              borderBottom: '1px solid rgba(65,73,63,0.12)',
              background: 'rgba(13,13,28,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c5ffbf', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e3e0f7' }}>
                Live Preview
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', background: '#0d0d1c', borderRadius: 8, padding: 3, gap: 2 }}>
                {(['desktop', 'tablet', 'mobile'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setPreviewViewport(v)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      transition: 'all 0.15s',
                      background: previewViewport === v ? '#333344' : 'transparent',
                      color: previewViewport === v ? '#c5ffbf' : '#8b9387',
                    }}
                  >
                    {v === 'desktop' ? '🖥' : v === 'tablet' ? '📱' : '📲'}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSidePanel(p => p === 'settings' ? null : 'settings')}
                style={{
                  padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', cursor: 'pointer',
                  fontSize: 11, fontWeight: 500,
                  background: sidePanel === 'settings' ? '#292839' : 'transparent',
                  color: sidePanel === 'settings' ? '#c5ffbf' : '#8b9387',
                }}
              >
                ⚙ Settings
              </button>
              <button
                onClick={() => setSidePanel(p => p === 'variables' ? null : 'variables')}
                style={{
                  padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                  fontSize: 11, fontWeight: 500,
                  border: `1px solid ${sidePanel === 'variables' ? 'rgba(203,166,247,0.4)' : 'rgba(65,73,63,0.2)'}`,
                  background: sidePanel === 'variables' ? 'rgba(203,166,247,0.12)' : 'transparent',
                  color: sidePanel === 'variables' ? '#cba6f7' : '#8b9387',
                }}
              >
                {'{{ }}'} Variables
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: 24,
                overflowY: 'auto',
                background: '#0d0d1c',
              }}
            >
              <div
                style={{
                  width: previewWidth,
                  maxWidth: '100%',
                  background: '#1e1e2e',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  minHeight: 500,
                  transition: 'width 0.3s',
                }}
              >
                <iframe
                  ref={frameRef}
                  style={{ width: '100%', height: 600, border: 'none', display: 'block', background: '#fff' }}
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
            {sidePanel === 'settings' && (
              <CustomizerPanel
                liquidCode={files[activeFile] ?? ''}
                currentVars={variables.values}
                onSettingChange={(key, val) => setVariable(key, val)}
              />
            )}
            {sidePanel === 'variables' && (
              <VariablesPanel
                variables={variables}
                onSetVariable={(key, val) => setVariable(key, val)}
                onAddVariable={(key, type) => addVariable(key, type)}
                onDeleteVariable={key => deleteVariable(key)}
                onToggleType={key => toggleVariableType(key)}
              />
            )}
          </div>

          <div
            style={{
              padding: '10px 20px',
              background: '#0d0d1c',
              borderTop: '1px solid rgba(65,73,63,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#8b9387' }}>
              <span style={{ color: '#c5ffbf' }}>⚡</span>
              Auto-Optimizing Assets — Compressing images and minifying CSS...
            </div>
            <button style={{ fontSize: 11, color: '#c5ffbf', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View Log</button>
          </div>
        </div>
      </div>

      <ConsolePanel />
    </div>
  );
}
