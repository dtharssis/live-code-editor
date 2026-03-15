import { ReactNode } from 'react';
import { cn } from '../../../lib/cn';

type Variant = 'html' | 'css' | 'js' | 'liquid';

const VARIANT_CLASSES: Record<Variant, string> = {
  html:   'bg-[rgba(243,139,168,0.12)] text-[var(--tag-h)]',
  css:    'bg-[rgba(137,180,250,0.12)] text-[var(--tag-c)]',
  js:     'bg-[rgba(249,226,175,0.12)] text-[var(--tag-j)]',
  liquid: 'bg-[rgba(203,166,247,0.12)] text-[var(--tag-l)]',
};

interface BadgeProps {
  variant:  Variant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'text-[9px] font-bold px-[7px] py-[2px] rounded uppercase tracking-[0.6px]',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
