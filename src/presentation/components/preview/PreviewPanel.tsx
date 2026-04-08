'use client';

import { useStore } from '../../store';
import { cn } from '../../../lib/cn';

interface PreviewPanelProps {
  ref:     React.Ref<HTMLIFrameElement>;
  onClear: () => void;
}

// React 19: ref is a regular prop — forwardRef is no longer needed
export function PreviewPanel({ ref, onClear }: PreviewPanelProps) {
  const mobileTab = useStore(s => s.mobileTab);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden min-w-[160px] flex-1',
        'max-md:hidden',
        mobileTab === 'preview' && 'max-md:flex max-md:flex-1',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-[5px] bg-[var(--surface2)] border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-[6px] text-[12px] text-[var(--text2)]">
          <span className="w-[7px] h-[7px] rounded-full animate-pulse bg-[var(--tag-l)]" />
          <span>Preview</span>
          <span className="text-[10px] px-2 py-[1px] rounded-full bg-[rgba(203,166,247,0.15)] text-[var(--tag-l)]">
            Liquid
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-[12px] px-[10px] py-[3px] rounded-md border border-[var(--border)] bg-[var(--surface2)] text-[var(--text)] cursor-pointer hover:border-[var(--accent)]"
        >
          Clear
        </button>
      </div>

      {/* Frame */}
      <div className="flex-1 overflow-hidden relative">
        <iframe
          ref={ref}
          className="absolute inset-0 w-full h-full border-none"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
