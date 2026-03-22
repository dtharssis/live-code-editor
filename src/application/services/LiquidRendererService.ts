/**
 * Application service: renders a Liquid/Jinja2 template with a variable map.
 * Pure function — no framework dependencies.
 */
export class LiquidRendererService {
  render(template: string, vars: Record<string, string>): string {
    let out = template;

    // Strip comments
    out = out.replace(
      /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g,
      '',
    );

    // {% if key != blank %} … {% else %} … {% endif %}
    out = out.replace(
      /\{%-?\s*if\s+(\w+)\s*!=\s*blank\s*-?%\}([\s\S]*?)(?:\{%-?\s*else\s*-?%\}([\s\S]*?))?\{%-?\s*endif\s*-?%\}/g,
      (_, k: string, ifBlock: string, elseBlock = '') =>
        vars[k] && vars[k] !== '' ? ifBlock : elseBlock,
    );

    // {% if key %} … {% else %} … {% endif %}
    out = out.replace(
      /\{%-?\s*if\s+(\w+)\s*-?%\}([\s\S]*?)(?:\{%-?\s*else\s*-?%\}([\s\S]*?))?\{%-?\s*endif\s*-?%\}/g,
      (_, k: string, ifBlock: string, elseBlock = '') => {
        const val = vars[k];
        const truthy = val && val !== 'false' && val !== '0';
        return truthy ? ifBlock : elseBlock;
      },
    );

    // {{ variable }}
    out = out.replace(
      /\{\{-?\s*([\w.]+)\s*-?\}\}/g,
      (_, key: string) => {
        const k = key.trim();
        if (vars[k] !== undefined) return vars[k];
        return `<mark style="background:rgba(203,166,247,.25);color:#cba6f7;border-radius:3px;padding:0 3px;font-size:11px">{{ ${k} }}</mark>`;
      },
    );

    // Strip remaining Liquid tags
    out = out.replace(/\{%-?[\s\S]*?-?%\}/g, '');

    return out;
  }
}
