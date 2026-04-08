import { ConsoleEntry } from '../../domain/entities/ConsoleEntry';

/**
 * Application service: static analysis / linting for CSS, JS and Liquid.
 * Returns a list of console entries with errors and warnings.
 */
export class CodeAnalyzerService {
  analyze(
    markup: string,
    css:    string,
    js:     string,
    mode:   'liquid' = 'liquid',
  ): ConsoleEntry[] {
    const issues: ConsoleEntry[] = [];
    let seq = 0;
    const add = (level: ConsoleEntry['level'], message: string, source: string) =>
      issues.push({ id: `${Date.now()}-${seq++}`, level, message, source, timestamp: Date.now() });

    // ── JavaScript checks ──────────────────────────────────────────────────
    js.split('\n').forEach((line, i) => {
      const t = line.trim();
      if (!t || t.startsWith('//')) return;

      for (const q of ["'", '"', '`'] as const) {
        const esc = q === '`' ? '\\`' : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const count = (t.match(new RegExp(esc, 'g')) ?? []).length;
        if (count % 2 !== 0)
          add('err', `Unclosed string — odd number of ${q}`, `JS:${i + 1}`);
      }

      if (/^(const|let|var|return)\s/.test(t) && !/[;{,]$/.test(t) && !t.endsWith('=>'))
        add('warn', 'Possible missing semicolon', `JS:${i + 1}`);
    });

    const jbO = (js.match(/\{/g) ?? []).length;
    const jbC = (js.match(/\}/g) ?? []).length;
    if (jbO > jbC) add('err', `Missing } — ${jbO} open, ${jbC} closed`, 'JS');
    if (jbC > jbO) add('err', `Extra } — ${jbC} closed, ${jbO} open`, 'JS');

    const pO = (js.match(/\(/g) ?? []).length;
    const pC = (js.match(/\)/g) ?? []).length;
    if (pO !== pC) add('err', `Unbalanced () — ${pO} open, ${pC} closed`, 'JS');

    // ── CSS checks ─────────────────────────────────────────────────────────
    const cbO = (css.match(/\{/g) ?? []).length;
    const cbC = (css.match(/\}/g) ?? []).length;
    if (cbO > cbC) add('err', `Missing } — ${cbO} open, ${cbC} closed`, 'CSS');
    if (cbC > cbO) add('err', `Extra } — ${cbC} closed, ${cbO} open`, 'CSS');

    // ── Liquid block balance ────────────────────────────────────────────────
    if (mode === 'liquid') {
      const blocks = ['if', 'for', 'unless', 'case', 'form', 'paginate'];
      blocks.forEach(b => {
        const opens  = (markup.match(new RegExp(`\\{%-?\\s*${b}[\\s%]`, 'g')) ?? []).length;
        const closes = (markup.match(new RegExp(`\\{%-?\\s*end${b}\\s*-?%\\}`, 'g')) ?? []).length;
        if (opens > closes)
          add('err', `Missing {% end${b} %} — ${opens} open, ${closes} closed`, 'Liquid');
      });
    }

    return issues;
  }
}
