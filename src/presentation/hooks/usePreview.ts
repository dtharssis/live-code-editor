'use client';

import { useCallback, useRef } from 'react';
import { useStore } from '../store';
import { LiquidRendererService } from '../../application/services/LiquidRendererService';
import { CodeAnalyzerService }   from '../../application/services/CodeAnalyzerService';
import { ConsoleEntry } from '../../domain/entities/ConsoleEntry';

const liquidRenderer = new LiquidRendererService();
const codeAnalyzer   = new CodeAnalyzerService();

export function usePreview(frameRef: React.RefObject<HTMLIFrameElement>) {
  const store = useStore();
  const seqRef = useRef(0);

  const run = useCallback(() => {
    const { mode, projects, variables, clearConsole, addConsoleEntry } = useStore.getState();
    const { markup, css, js } = projects[mode];

    clearConsole();

    // Static analysis
    const issues = codeAnalyzer.analyze(markup, css, js, mode);
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

    // Render markup
    const html = mode === 'liquid'
      ? liquidRenderer.render(markup, variables.values)
      : markup;

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

    // Runtime error relay
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
