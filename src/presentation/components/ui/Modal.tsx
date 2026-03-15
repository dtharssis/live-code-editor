'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '../../../lib/cn';

interface ModalProps {
  open:     boolean;
  onClose:  () => void;
  title:    ReactNode;
  width?:   string;
  children: ReactNode;
  titleClassName?: string;
}

export function Modal({ open, onClose, title, width = '480px', children, titleClassName }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[500] bg-black/55"
        onClick={onClose}
      />

      {/* Box */}
      <div
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'z-[501] flex flex-col overflow-hidden',
          'bg-[var(--surface)] border border-[var(--border)] rounded-xl',
          'shadow-[0_24px_64px_rgba(0,0,0,0.7)]',
          'max-h-[88vh] max-w-[92vw]',
          // Mobile: full width bottom sheet
          'max-md:w-screen max-md:max-w-screen max-md:h-[90vh] max-md:max-h-[90vh]',
          'max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:translate-x-0 max-md:translate-y-0',
          'max-md:rounded-t-2xl max-md:rounded-b-none',
        )}
        style={{ width }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-[14px] bg-[var(--surface2)] border-b border-[var(--border)] flex-shrink-0">
          <span className={cn('text-[13px] font-semibold', titleClassName)}>{title}</span>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[var(--text2)] text-xl cursor-pointer leading-none px-1 hover:text-[var(--text)]"
          >
            ×
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}
