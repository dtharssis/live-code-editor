'use client';

import { useRef, useState } from 'react';
import { VariableType } from '@/domain/value-objects/types';

interface VariableStore {
  values: Record<string, string>;
  meta:   Record<string, VariableType>;
}

interface VariablesPanelProps {
  variables:          VariableStore;
  onSetVariable:      (key: string, value: string) => void;
  onAddVariable:      (key: string, type: VariableType) => void;
  onDeleteVariable:   (key: string) => void;
  onToggleType:       (key: string) => void;
}

export function VariablesPanel({
  variables,
  onSetVariable,
  onAddVariable,
  onDeleteVariable,
  onToggleType,
}: VariablesPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName]         = useState('');
  const [newType, setNewType]         = useState<VariableType>('text');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const keys = Object.keys(variables.values);

  const confirmAdd = () => {
    const key = newName.trim().replace(/\s+/g, '_');
    if (!key) return;
    onAddVariable(key, newType);
    setNewName('');
    setShowAddForm(false);
  };

  const s: React.CSSProperties = {
    width: 260, borderLeft: '1px solid rgba(65,73,63,0.15)',
    background: '#111120', display: 'flex', flexDirection: 'column',
    flexShrink: 0, overflowY: 'auto',
  };

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '6px 10px', background: '#0d0d1c',
    border: '1px solid rgba(65,73,63,0.2)', borderRadius: 7,
    color: '#e3e0f7', fontSize: 12, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(65,73,63,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#41493f' }}>
          {'{{ }}'} Variables
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(203,166,247,0.3)', background: 'rgba(203,166,247,0.08)', color: '#cba6f7', cursor: 'pointer' }}
        >
          + Add
        </button>
      </div>

      <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        {/* Add form */}
        {showAddForm && (
          <div style={{ margin: '0 12px 12px', background: '#0d0d1c', border: '1px solid rgba(65,73,63,0.2)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setShowAddForm(false); }}
              placeholder="variable_name"
              autoFocus
              style={{ ...inputBase }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setNewType('text')}
                style={{ flex: 1, fontSize: 11, padding: '4px 0', borderRadius: 6, cursor: 'pointer', border: '1px solid', background: newType === 'text' ? 'rgba(137,180,250,0.15)' : '#1a1a2a', color: newType === 'text' ? '#89b4fa' : '#8b9387', borderColor: newType === 'text' ? 'rgba(137,180,250,0.3)' : 'rgba(65,73,63,0.2)' }}
              >
                ⚙ Text
              </button>
              <button
                onClick={() => setNewType('media')}
                style={{ flex: 1, fontSize: 11, padding: '4px 0', borderRadius: 6, cursor: 'pointer', border: '1px solid', background: newType === 'media' ? 'rgba(203,166,247,0.15)' : '#1a1a2a', color: newType === 'media' ? '#cba6f7' : '#8b9387', borderColor: newType === 'media' ? 'rgba(203,166,247,0.3)' : 'rgba(65,73,63,0.2)' }}
              >
                📷 Media
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(65,73,63,0.2)', background: '#1a1a2a', color: '#8b9387', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAdd}
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontWeight: 700, cursor: 'pointer' }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {keys.length === 0 && !showAddForm && (
          <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: '#41493f', lineHeight: 1.6 }}>
            No variables yet.<br />Click <strong style={{ color: '#cba6f7' }}>+ Add</strong> to create one.
          </div>
        )}

        {keys.map(key => {
          const value    = variables.values[key];
          const type     = variables.meta[key] ?? 'text';
          const hasMedia = type === 'media' && value && value.startsWith('data:');

          return (
            <div key={key} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(65,73,63,0.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#cba6f7', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {'{{ '}{key}{' }}'}
                </span>
                <button
                  onClick={() => onToggleType(key)}
                  style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, border: '1px solid', cursor: 'pointer', flexShrink: 0, background: '#1a1a2a', color: type === 'media' ? '#cba6f7' : '#89b4fa', borderColor: type === 'media' ? 'rgba(203,166,247,0.25)' : 'rgba(137,180,250,0.25)' }}
                >
                  {type === 'media' ? '📷' : '⚙'}
                </button>
                <button
                  onClick={() => onDeleteVariable(key)}
                  style={{ background: 'transparent', border: 'none', color: '#41493f', cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0 }}
                >
                  ×
                </button>
              </div>

              {type === 'text' ? (
                <input
                  value={value}
                  onChange={e => onSetVariable(key, e.target.value)}
                  placeholder="value..."
                  style={{ ...inputBase }}
                />
              ) : (
                <>
                  <button
                    onClick={() => fileInputRefs.current[key]?.click()}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: '#c5ffbf', padding: '6px 10px', borderRadius: 6, border: '1px dashed rgba(65,73,63,0.3)', background: '#0d0d1c', cursor: 'pointer', overflow: 'hidden' }}
                  >
                    {hasMedia && (
                      <span style={{ width: 22, height: 22, borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </span>
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hasMedia ? '✓ Change file' : '⬆ Upload file'}
                    </span>
                  </button>
                  <input
                    ref={el => { fileInputRefs.current[key] = el; }}
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => onSetVariable(key, ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
