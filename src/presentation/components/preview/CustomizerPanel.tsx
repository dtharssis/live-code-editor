'use client';

import { useMemo, useEffect, useRef, useState } from 'react';
import { SchemaParserService, type SchemaSetting } from '@/application/services/SchemaParserService';

const parser = new SchemaParserService();

interface CustomizerPanelProps {
  liquidCode:      string;
  currentVars:     Record<string, string>;
  onSettingChange: (key: string, value: string) => void;
}

export function CustomizerPanel({ liquidCode, currentVars, onSettingChange }: CustomizerPanelProps) {
  const schema = useMemo(() => parser.parse(liquidCode), [liquidCode]);

  // Local values — initialised from schema defaults, overridden by currentVars
  const [values, setValues] = useState<Record<string, string>>({});
  const initialisedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!schema) return;
    // Re-initialise only when the schema name changes (new component loaded)
    if (initialisedRef.current === schema.name) return;
    initialisedRef.current = schema.name;

    const defaults = parser.getDefaults(schema.settings);
    const merged: Record<string, string> = { ...defaults };
    // Prefer values already set in the store
    for (const k of Object.keys(defaults)) {
      if (currentVars[k] !== undefined) merged[k] = currentVars[k];
    }
    setValues(merged);
    // Push defaults into store so renderer has them immediately
    for (const [k, v] of Object.entries(merged)) {
      onSettingChange(k, v);
    }
  }, [schema?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  function change(id: string, val: string) {
    const key = `section.settings.${id}`;
    setValues(prev => ({ ...prev, [key]: val }));
    onSettingChange(key, val);
  }

  if (!schema) {
    return (
      <div style={{ width: 260, borderLeft: '1px solid rgba(65,73,63,0.15)', background: '#111120', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(65,73,63,0.1)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#41493f' }}>
          Customizer
        </div>
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, opacity: 0.15, marginBottom: 10 }}>⚙</div>
          <div style={{ fontSize: 12, color: '#41493f', lineHeight: 1.5 }}>
            No <code style={{ background: '#1a1a2a', padding: '1px 5px', borderRadius: 3 }}>{'{% schema %}'}</code> found.
            <br />Add a schema block to configure settings here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: 260, borderLeft: '1px solid rgba(65,73,63,0.15)', background: '#111120', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(65,73,63,0.1)', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#41493f', marginBottom: 2 }}>Customizer</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e3e0f7', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>{schema.name}</div>
      </div>

      {/* Settings */}
      <div style={{ padding: '12px 0', flex: 1 }}>
        {schema.settings.map((s, i) => (
          <SettingRow
            key={s.id ?? `sep-${i}`}
            setting={s}
            value={values[`section.settings.${s.id}`] ?? ''}
            onChange={val => s.id && change(s.id, val)}
          />
        ))}
      </div>
    </div>
  );
}

function SettingRow({ setting: s, value, onChange }: {
  setting:  SchemaSetting;
  value:    string;
  onChange: (v: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', background: '#0d0d1c',
    border: '1px solid rgba(65,73,63,0.2)', borderRadius: 7,
    color: '#e3e0f7', fontSize: 12, outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box',
  };

  // Header separator
  if (s.type === 'header') {
    return (
      <div style={{ padding: '14px 16px 6px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#41493f', borderTop: '1px solid rgba(65,73,63,0.08)', marginTop: 4 }}>
        {s.content ?? s.label}
      </div>
    );
  }

  // Paragraph info
  if (s.type === 'paragraph') {
    return (
      <div style={{ padding: '4px 16px 8px', fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
        {s.content ?? s.label}
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 16px' }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8b9387', marginBottom: 5, letterSpacing: '0.02em' }}>
        {s.label}
      </label>

      {s.type === 'text' || s.type === 'url' ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      ) : s.type === 'textarea' || s.type === 'richtext' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
        />
      ) : s.type === 'number' ? (
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      ) : s.type === 'range' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>{s.min ?? 0}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#c5ffbf', fontFamily: 'monospace' }}>{value}{s.unit ?? ''}</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>{s.max ?? 100}</span>
          </div>
          <input
            type="range"
            min={s.min ?? 0} max={s.max ?? 100} step={s.step ?? 1}
            value={value || String(s.min ?? 0)}
            onChange={e => onChange(e.target.value)}
            style={{ width: '100%', accentColor: '#c5ffbf' }}
          />
        </div>
      ) : s.type === 'color' ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
            onChange={e => onChange(e.target.value)}
            style={{ width: 36, height: 32, border: '1px solid rgba(65,73,63,0.2)', borderRadius: 6, cursor: 'pointer', background: 'none', padding: 2 }}
          />
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            placeholder="#000000"
          />
        </div>
      ) : s.type === 'checkbox' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={e => onChange(e.target.checked ? 'true' : 'false')}
            style={{ accentColor: '#c5ffbf', width: 14, height: 14 }}
          />
          <span style={{ fontSize: 12, color: '#c1c9bc' }}>{value === 'true' ? 'Enabled' : 'Disabled'}</span>
        </label>
      ) : s.type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {(s.options ?? []).map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : s.type === 'image_picker' ? (
        <ImagePickerInput value={value} onChange={onChange} />
      ) : null}

      {s.info && (
        <div style={{ marginTop: 4, fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>{s.info}</div>
      )}
    </div>
  );
}

function ImagePickerInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') onChange(reader.result); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {value ? (
        <div style={{ position: 'relative' }}>
          <img src={value} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 7, border: '1px solid rgba(65,73,63,0.2)', display: 'block' }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button onClick={() => ref.current?.click()} style={{ flex: 1, padding: '5px 0', background: '#1e1e2e', border: '1px solid rgba(65,73,63,0.2)', borderRadius: 6, color: '#8b9387', fontSize: 11, cursor: 'pointer' }}>
              Change
            </button>
            <button onClick={() => onChange('')} style={{ padding: '5px 10px', background: 'transparent', border: '1px solid rgba(65,73,63,0.2)', borderRadius: 6, color: '#41493f', fontSize: 11, cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          style={{ width: '100%', padding: '18px 0', background: '#0d0d1c', border: '1px dashed rgba(65,73,63,0.3)', borderRadius: 7, color: '#41493f', fontSize: 12, cursor: 'pointer', textAlign: 'center' }}
        >
          + Upload image
        </button>
      )}
    </div>
  );
}
