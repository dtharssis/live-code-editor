'use client';

import { useCallback, useRef } from 'react';
import { useStore } from '../store';
import { LiquidRendererService } from '../../application/services/LiquidRendererService';
import { CodeAnalyzerService }   from '../../application/services/CodeAnalyzerService';
import { ConsoleEntry } from '../../domain/entities/ConsoleEntry';

const liquidRenderer = new LiquidRendererService();
const codeAnalyzer   = new CodeAnalyzerService();

export function usePreview(frameRef: React.RefObject<HTMLIFrameElement>) {
  const seqRef = useRef(0);

  const run = useCallback(() => {
    const { files, variables, clearConsole, addConsoleEntry } = useStore.getState();

    // Combine all files by type — preview is always the full result
    const markup = Object.entries(files)
      .filter(([name]) => name.endsWith('.liquid'))
      .map(([, content]) => content)
      .join('\n');
    const css = Object.entries(files)
      .filter(([name]) => name.endsWith('.css'))
      .map(([, content]) => content)
      .join('\n');
    const js = Object.entries(files)
      .filter(([name]) => name.endsWith('.js'))
      .map(([, content]) => content)
      .join('\n');

    clearConsole();

    // Static analysis
    const issues = codeAnalyzer.analyze(markup, css, js, 'liquid');
    if (issues.length === 0) {
      addConsoleEntry({
        id:        `${Date.now()}-${seqRef.current++}`,
        level:     'info',
        message:   'No issues detected.',
        timestamp: Date.now(),
      } as ConsoleEntry);
    } else {
      issues.forEach(addConsoleEntry);
    }

    // Render Liquid markup
    const html = liquidRenderer.render(markup, variables.values);

    const isMobile = window.innerWidth <= 768;
    const mobileReset = isMobile
      ? `<style>
          *{min-height:0!important}
          html{height:auto!important;min-height:0!important}
          body{height:auto!important;min-height:0!important;display:block!important;
               align-items:unset!important;justify-content:unset!important;padding:16px!important;margin:0!important}
         </style>`
      : '';

    const frame = frameRef.current;
    if (!frame) return;

    const fdoc = frame.contentDocument ?? frame.contentWindow?.document;
    if (!fdoc) return;

    frame.contentWindow!.onerror = (msg, _src, line) => {
      addConsoleEntry({
        id:        `${Date.now()}-${seqRef.current++}`,
        level:     'err',
        message:   `${msg} (line ${line})`,
        source:    'Runtime',
        timestamp: Date.now(),
      });
      return true;
    };

    fdoc.open();
    fdoc.write(
      `<html lang="en"><head>${mobileReset}<style>${css}</style></head><body>${html}</body></html>`,
    );
    fdoc.close();

    if (js.trim()) {
      const s = fdoc.createElement('script');
      s.text = js;
      fdoc.body.appendChild(s);
    }
  }, [frameRef]);

  return { run };
}
