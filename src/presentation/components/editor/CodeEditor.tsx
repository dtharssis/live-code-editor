'use client';

import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { oneDark }          from '@codemirror/theme-one-dark';
import { html }             from '@codemirror/lang-html';
import { css }              from '@codemirror/lang-css';
import { javascript }       from '@codemirror/lang-javascript';
import { StreamLanguage }   from '@codemirror/language';
import { jinja2 }           from '@codemirror/legacy-modes/mode/jinja2';
import { PaneId }           from '../../../domain/value-objects/types';

type Lang = PaneId | 'liquid-markup';

function getLangExtension(lang: Lang) {
  switch (lang) {
    case 'markup':        return html();
    case 'liquid-markup': return StreamLanguage.define(jinja2);
    case 'css':           return css();
    case 'js':            return javascript();
  }
}

const fixedTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px' },
  '.cm-scroller': { fontFamily: "'Fira Code', 'JetBrains Mono', monospace", lineHeight: '1.65', overflow: 'auto' },
});

interface CodeEditorProps {
  lang:     Lang;
  value:    string;
  onChange: (value: string) => void;
  isDark:   boolean;
}

export function CodeEditor({ lang, value, onChange, isDark }: CodeEditorProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const viewRef       = useRef<EditorView | null>(null);
  const langCompart   = useRef(new Compartment());
  const themeCompart  = useRef(new Compartment());
  const onChangeRef   = useRef(onChange);
  onChangeRef.current = onChange;

  // ── Mount editor ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          fixedTheme,
          langCompart.current.of(getLangExtension(lang)),
          themeCompart.current.of(isDark ? oneDark : []),
          EditorView.updateListener.of(update => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync external value changes ───────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  // ── Reconfigure language ──────────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: langCompart.current.reconfigure(getLangExtension(lang)) });
  }, [lang]);

  // ── Reconfigure theme ─────────────────────────────────────────────────────
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: themeCompart.current.reconfigure(isDark ? oneDark : []) });
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden [&_.cm-editor]:h-full"
    />
  );
}
