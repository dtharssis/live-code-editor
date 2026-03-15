'use client';

import { useStore } from '../../store';
import { EditorMode } from '../../../domain/value-objects/types';
import { cn } from '../../../lib/cn';

interface AppHeaderProps {
  onRun: () => void;
}

const THEME_LABELS: Record<string, string> = { auto: 'Auto', dark: 'Dark', light: 'Light' };

export function AppHeader({ onRun }: AppHeaderProps) {
  const mode        = useStore(s => s.mode);
  const theme       = useStore(s => s.theme);
  const autoRun     = useStore(s => s.autoRun);
  const setMode     = useStore(s => s.setMode);
  const cycleTheme  = useStore(s => s.cycleTheme);
  const setAutoRun  = useStore(s => s.setAutoRun);
  const openModal   = useStore(s => s.openModal);

  const switchMode = (m: EditorMode) => setMode(m);

  return (
    <header className="flex items-center justify-between px-4 h-12 bg-[var(--bg2)] border-b border-[var(--border)] flex-shrink-0 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#89b4fa] to-[#cba6f7] flex items-center justify-center text-[12px] font-bold text-[#1e1e2e] flex-shrink-0">
          &lt;/&gt;
        </div>
        <span className="text-[15px] font-semibold">Live Editor</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Mode switcher */}
        <div className="flex border border-[var(--border)] rounded-md overflow-hidden">
          <button
            onClick={() => switchMode('html')}
            className={cn(
              'px-[14px] py-[5px] text-[12px] font-semibold cursor-pointer border-none transition-colors duration-100',
              mode === 'html'
                ? 'bg-[rgba(243,139,168,0.15)] text-[var(--tag-h)]'
                : 'bg-[var(--surface2)] text-[var(--text2)] hover:text-[var(--text)]',
            )}
          >
            HTML
          </button>
          <button
            onClick={() => switchMode('liquid')}
            className={cn(
              'px-[14px] py-[5px] text-[12px] font-semibold cursor-pointer border-none transition-colors duration-100',
              mode === 'liquid'
                ? 'bg-[rgba(203,166,247,0.15)] text-[var(--tag-l)]'
                : 'bg-[var(--surface2)] text-[var(--text2)] hover:text-[var(--text)]',
            )}
          >
            {'{% Liquid %}'}
          </button>
        </div>

        {/* Auto-run */}
        <label className="hidden md:flex items-center gap-[6px] text-[12px] text-[var(--text2)] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRun}
            onChange={e => setAutoRun(e.target.checked)}
            className="accent-[var(--accent)] cursor-pointer"
          />
          Auto-run
        </label>

        {/* Run */}
        <button
          onClick={onRun}
          className="px-[14px] py-[5px] rounded-md border border-[var(--green)] bg-[var(--green)] text-[var(--green-text)] text-[13px] font-bold cursor-pointer transition-opacity hover:opacity-85"
        >
          ▶ Run
        </button>

        {/* Export — HTML mode */}
        {mode === 'html' && (
          <button
            onClick={() => openModal('html-export')}
            className="hidden md:block px-[14px] py-[5px] rounded-md border border-[rgba(243,139,168,0.3)] bg-[rgba(243,139,168,0.15)] text-[var(--tag-h)] text-[13px] font-semibold cursor-pointer hover:bg-[rgba(243,139,168,0.25)] hover:border-[var(--tag-h)]"
          >
            ↙ Export
          </button>
        )}

        {/* Export — Liquid mode */}
        {mode === 'liquid' && (
          <button
            onClick={() => openModal('shopify-export')}
            className="hidden md:block px-[14px] py-[5px] rounded-md border border-[rgba(203,166,247,0.3)] bg-[rgba(203,166,247,0.15)] text-[var(--tag-l)] text-[13px] font-semibold cursor-pointer hover:bg-[rgba(203,166,247,0.25)] hover:border-[var(--tag-l)]"
          >
            ↙ Export
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="flex items-center gap-[5px] px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface2)] cursor-pointer text-[12px] text-[var(--text)] hover:border-[var(--accent)]"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0" />
          <span>{THEME_LABELS[theme]}</span>
        </button>
      </div>
    </header>
  );
}
