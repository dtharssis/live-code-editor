'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore }         from '../store';
import { useTheme }         from '../hooks/useTheme';
import { usePreview }       from '../hooks/usePreview';
import { AppHeader }        from './layout/AppHeader';
import { AppFooter }        from './layout/AppFooter';
import { EditorPanel }      from './editor/EditorPanel';
import { PreviewPanel }     from './preview/PreviewPanel';
import { ConsolePanel }     from './preview/ConsolePanel';
import { VariablesModal }   from './modals/VariablesModal';
import { HtmlExportModal }  from './modals/HtmlExportModal';
import { ShopifyExportModal } from './modals/ShopifyExportModal';

export function LiveEditor() {
  useTheme(); // syncs theme token to <html data-theme>

  const autoRun    = useStore(s => s.autoRun);
  const projects   = useStore(s => s.projects);
  const mode       = useStore(s => s.mode);
  const variables  = useStore(s => s.variables);
  const theme      = useStore(s => s.theme);

  const frameRef   = useRef<HTMLIFrameElement>(null);
  const mainRef    = useRef<HTMLDivElement>(null);
  const { run }    = usePreview(frameRef);

  // Layout measurement
  const [dims, setDims] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Determine dark/light for CodeMirror
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const check = () => {
      const t = document.documentElement.getAttribute('data-theme');
      setIsDark(t !== 'light');
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, [theme]);

  // Auto-run when code / variables change
  const runRef = useRef(run);
  runRef.current = run;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRun = useCallback(() => {
    if (!autoRun) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runRef.current(), 600);
  }, [autoRun]);

  // Watch for code changes
  const prevCodeRef = useRef('');
  useEffect(() => {
    const { markup, css, js } = projects[mode];
    const key = markup + css + js + JSON.stringify(variables.values);
    if (key !== prevCodeRef.current) {
      prevCodeRef.current = key;
      scheduleRun();
    }
  }, [projects, mode, variables, scheduleRun]);

  // Run once on mount
  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearEditor = () => {
    useStore.getState().updateCode('markup', '');
    useStore.getState().updateCode('css', '');
    useStore.getState().updateCode('js', '');
    const frame = frameRef.current;
    if (!frame) return;
    const fdoc = frame.contentDocument ?? frame.contentWindow?.document;
    if (!fdoc) return;
    fdoc.open();
    fdoc.write('<!DOCTYPE html><html><body></body></html>');
    fdoc.close();
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      <AppHeader onRun={run} />

      {/* Main area */}
      <div ref={mainRef} className="flex flex-1 overflow-hidden min-h-0 relative">
        <EditorPanel
          totalWidth={dims.width}
          totalHeight={dims.height}
          isDark={isDark}
        />
        <PreviewPanel ref={frameRef} onClear={clearEditor} />
      </div>

      <ConsolePanel />
      <AppFooter />

      {/* Modals */}
      <VariablesModal />
      <HtmlExportModal />
      <ShopifyExportModal />
    </div>
  );
}
