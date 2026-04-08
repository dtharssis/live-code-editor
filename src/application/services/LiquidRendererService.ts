/**
 * Application service: renders a Liquid/Jinja2 template with a variable map.
 * Pure function — no framework dependencies.
 */
export class LiquidRendererService {
  render(template: string, vars: Record<string, string>): string {
    let out = template;

    // Strip {% schema %}...{% endschema %} blocks (must happen first — before tag stripper)
    out = out.replace(
      /\{%-?\s*schema\s*-?%\}[\s\S]*?\{%-?\s*endschema\s*-?%\}/g,
      '',
    );

    // Strip {% comment %}...{% endcomment %}
    out = out.replace(
      /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g,
      '',
    );

    // {% if key != blank %} … {% else %} … {% endif %}
    // Supports dot-notation: section.settings.foo, block.settings.bar
    out = out.replace(
      /\{%-?\s*if\s+([\w.]+)\s*!=\s*blank\s*-?%\}([\s\S]*?)(?:\{%-?\s*else\s*-?%\}([\s\S]*?))?\{%-?\s*endif\s*-?%\}/g,
      (_, k: string, ifBlock: string, elseBlock = '') =>
        vars[k] && vars[k] !== '' ? ifBlock : elseBlock,
    );

    // {% if key %} … {% else %} … {% endif %}
    out = out.replace(
      /\{%-?\s*if\s+([\w.]+)\s*-?%\}([\s\S]*?)(?:\{%-?\s*else\s*-?%\}([\s\S]*?))?\{%-?\s*endif\s*-?%\}/g,
      (_, k: string, ifBlock: string, elseBlock = '') => {
        const val = vars[k];
        const truthy = val && val !== 'false' && val !== '0';
        return truthy ? ifBlock : elseBlock;
      },
    );

    // {{ variable }} — supports dot-notation (section.settings.heading, etc.)
    out = out.replace(
      /\{\{-?\s*([\w.]+)(?:\s*\|[^}]*)?\s*-?\}\}/g,
      (_, key: string) => {
        const k = key.trim();
        if (vars[k] !== undefined) return vars[k];
        return '';
      },
    );

    // Strip remaining Liquid tags
    out = out.replace(/\{%-?[\s\S]*?-?%\}/g, '');

    return out;
  }
}
