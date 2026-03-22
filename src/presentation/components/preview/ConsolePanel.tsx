'use client';

import { useStore } from '../../store';
import { ConsoleEntry } from '../../../domain/entities/ConsoleEntry';
import { cn } from '../../../lib/cn';

const ICONS: Record<ConsoleEntry['level'], string> = { err: '✕', warn: '⚠', info: 'ℹ', log: '›' };

export function ConsolePanel() {
  const entries      = useStore(s => s.consoleEntries);
  const errorCount   = useStore(s => s.errorCount);
  const isOpen       = useStore(s => s.consoleOpen);
  const toggleConsole = useStore(s => s.toggleConsole);
  const clearConsole = useStore(s => s.clearConsole);

  return (
    <div
      className={cn(
        'flex-shrink-0 bg-[var(--bg2)] border-t border-[var(--border)]',
        'font-mono text-[12px] flex flex-col transition-all duration-200 overflow-hidden',
        isOpen ? 'h-40' : 'h-7',
      )}
    >
      {/* Header */}
      <div
        onClick={toggleConsole}
        className="flex items-center justify-between px-3 h-7 min-h-[28px] bg-[var(--surface2)] border-b border-[var(--border)] cursor-pointer select-none"
      >
        <div className="flex items-center gap-[6px] text-[11px] text-[var(--text2)]">
          <span
            className={cn(
              'text-[10px] transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            )}
          >
            ▲
          </span>
          <span>Console</span>
          {errorCount > 0 && (
            <span className="text-[10px] px-[6px] py-[1px] rounded-full bg-[rgba(243,139,168,0.15)] text-[var(--tag-h)]">
              {errorCount}
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); clearConsole(); }}
          className="text-[11px] text-[var(--text2)] bg-transparent border-none cursor-pointer px-[6px] py-[2px] rounded hover:text-[var(--text)]"
        >
          Clear
        </button>
      </div>

      {/* Lines */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="px-3 py-[10px] text-[12px] text-[var(--text2)] italic">
              No errors or warnings.
            </div>
          ) : (
            entries.map(entry => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-baseline gap-2 px-3 py-[3px] border-b border-[var(--border)] last:border-0 leading-[1.5]',
                )}
              >
                <span
                  className={cn(
                    'text-[10px] flex-shrink-0',
                    entry.level === 'err'  && 'text-[var(--tag-h)]',
                    entry.level === 'warn' && 'text-[var(--tag-j)]',
                    entry.level === 'info' && 'text-[var(--accent)]',
                  )}
                >
                  {ICONS[entry.level]}
                </span>
                {entry.source && (
                  <span className="text-[10px] text-[var(--text2)] flex-shrink-0 min-w-[52px]">
                    {entry.source}
                  </span>
                )}
                <span
                  className={cn(
                    'break-all flex-1',
                    entry.level === 'err'  && 'text-[var(--tag-h)]',
                    entry.level === 'warn' && 'text-[var(--tag-j)]',
                    (entry.level === 'info' || entry.level === 'log') && 'text-[var(--text2)]',
                  )}
                >
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
