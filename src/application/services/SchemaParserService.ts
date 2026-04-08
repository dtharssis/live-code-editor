export type SchemaSettingType =
  | 'text' | 'textarea' | 'richtext' | 'color'
  | 'checkbox' | 'select' | 'image_picker'
  | 'number' | 'range' | 'header' | 'paragraph' | 'url';

export interface SchemaSettingOption {
  value: string;
  label: string;
}

export interface SchemaSetting {
  type:     SchemaSettingType;
  id?:      string;
  label?:   string;
  content?: string; // header / paragraph
  default?: string | number | boolean;
  min?:     number;
  max?:     number;
  step?:    number;
  unit?:    string;
  options?: SchemaSettingOption[];
  info?:    string;
}

export interface ParsedSchema {
  name:     string;
  settings: SchemaSetting[];
}

export class SchemaParserService {
  parse(liquidCode: string): ParsedSchema | null {
    const match = liquidCode.match(
      /\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/,
    );
    if (!match) return null;

    try {
      const json = JSON.parse(match[1].trim());
      return {
        name:     typeof json.name === 'string' ? json.name : 'Section',
        settings: Array.isArray(json.settings) ? json.settings : [],
      };
    } catch {
      return null;
    }
  }

  /** Returns default values keyed as "section.settings.<id>" */
  getDefaults(settings: SchemaSetting[]): Record<string, string> {
    const out: Record<string, string> = {};
    for (const s of settings) {
      if (!s.id) continue;
      const key = `section.settings.${s.id}`;
      if (s.default === undefined || s.default === null) {
        out[key] = s.type === 'checkbox' ? 'false' : '';
      } else if (typeof s.default === 'boolean') {
        out[key] = s.default ? 'true' : 'false';
      } else {
        out[key] = String(s.default);
      }
    }
    return out;
  }
}
