export function AppFooter() {
  return (
    <footer className="flex-shrink-0 h-[26px] bg-[var(--bg2)] border-t border-[var(--border)] flex items-center justify-center gap-[6px] text-[11px] text-[var(--text2)] select-none">
      <span>© {new Date().getFullYear()} Live Editor</span>
      <span className="opacity-40">·</span>
      <span>Built with Claude AI</span>
      <span className="opacity-40">·</span>
      <span>
        by{' '}
        <a
          href="https://github.com/dtharssis"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--text2)] no-underline hover:text-[var(--accent)] transition-colors"
        >
          @dtharssis
        </a>
      </span>
    </footer>
  );
}
