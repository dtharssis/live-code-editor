'use client';

import { useRef, useState } from 'react';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { VariableType } from '../../../domain/value-objects/types';

export function VariablesModal() {
  const activeModal       = useStore(s => s.activeModal);
  const closeModal        = useStore(s => s.closeModal);
  const variables         = useStore(s => s.variables);
  const setVariable       = useStore(s => s.setVariable);
  const addVariable       = useStore(s => s.addVariable);
  const deleteVariable    = useStore(s => s.deleteVariable);
  const toggleVariableType = useStore(s => s.toggleVariableType);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName]         = useState('');
  const [newType, setNewType]         = useState<VariableType>('text');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const isOpen = activeModal === 'variables';

  const confirmAdd = () => {
    const key = newName.trim().replace(/\s+/g, '_');
    if (!key) return;
    addVariable(key, newType);
    setNewName('');
    setShowAddForm(false);
  };

  const keys = Object.keys(variables.values);

  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      title={'{{ }} Liquid Variables'}
      titleClassName="text-[var(--tag-l)]"
      width="580px"
    >
      <div className="px-4 py-3 flex flex-col gap-3">

        {/* Add variable button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="text-[11px] font-semibold px-[10px] py-[3px] rounded border border-[rgba(203,166,247,0.3)] bg-[rgba(203,166,247,0.1)] text-[var(--tag-l)] cursor-pointer hover:bg-[rgba(203,166,247,0.2)]"
          >
            + Add variable
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') setShowAddForm(false); }}
                placeholder="variable_name"
                spellCheck={false}
                autoFocus
                className="flex-1 text-[12px] px-[10px] py-[5px] rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--text2)]"
              />
              <div className="flex gap-[6px]">
                <button
                  onClick={() => setNewType('text')}
                  className={`text-[11px] px-3 py-1 rounded border cursor-pointer transition-colors ${
                    newType === 'text'
                      ? 'bg-[rgba(137,180,250,0.15)] text-[var(--tag-c)] border-[rgba(137,180,250,0.3)]'
                      : 'bg-[var(--surface2)] text-[var(--text2)] border-[var(--border)]'
                  }`}
                >
                  ⚙ Text
                </button>
                <button
                  onClick={() => setNewType('media')}
                  className={`text-[11px] px-3 py-1 rounded border cursor-pointer transition-colors ${
                    newType === 'media'
                      ? 'bg-[rgba(203,166,247,0.15)] text-[var(--tag-l)] border-[rgba(203,166,247,0.3)]'
                      : 'bg-[var(--surface2)] text-[var(--text2)] border-[var(--border)]'
                  }`}
                >
                  📷 Media
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddForm(false)}
                className="text-[12px] px-[14px] py-1 rounded border border-[var(--border)] bg-[var(--surface2)] text-[var(--text)] cursor-pointer hover:border-[var(--accent)]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAdd}
                className="text-[12px] px-[14px] py-1 rounded border border-[var(--accent)] bg-[var(--accent)] text-[#1e1e2e] font-semibold cursor-pointer hover:opacity-90"
              >
                Add variable
              </button>
            </div>
          </div>
        )}

        {/* Variable rows */}
        {keys.length === 0 && !showAddForm && (
          <p className="text-[12px] text-[var(--text2)] italic text-center py-6">
            No variables yet. Click &quot;+ Add variable&quot; to create one.
          </p>
        )}

        {keys.map(key => {
          const value = variables.values[key];
          const type  = variables.meta[key] ?? 'text';
          const hasMedia = type === 'media' && value && value.startsWith('data:');

          return (
            <div
              key={key}
              className="flex items-center gap-2 py-[6px] border-b border-[var(--border)] last:border-0"
            >
              {/* Key */}
              <span className="text-[11px] text-[var(--tag-l)] font-mono whitespace-nowrap min-w-[110px] overflow-hidden text-ellipsis">
                {'{{ '}{key}{' }}'}
              </span>

              {/* Type toggle */}
              <button
                onClick={() => toggleVariableType(key)}
                className={`text-[10px] px-2 py-[2px] rounded border cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  type === 'media'
                    ? 'text-[var(--tag-l)] border-[rgba(203,166,247,0.25)] bg-[var(--surface2)]'
                    : 'text-[var(--tag-c)] border-[rgba(137,180,250,0.25)] bg-[var(--surface2)]'
                }`}
              >
                {type === 'media' ? '📷 Media' : '⚙ Text'}
              </button>

              {/* Value / Upload */}
              {type === 'text' ? (
                <input
                  value={value}
                  onChange={e => setVariable(key, e.target.value)}
                  placeholder="value..."
                  className="flex-1 text-[12px] px-2 py-[3px] rounded border border-[var(--border)] bg-[var(--bg2)] text-[var(--text)] font-mono min-w-0 focus:outline-none focus:border-[var(--accent)]"
                />
              ) : (
                <>
                  <button
                    onClick={() => fileInputRefs.current[key]?.click()}
                    className="flex-1 flex items-center gap-[7px] text-[11px] text-[var(--accent)] px-[10px] py-[3px] rounded border border-dashed border-[var(--border)] bg-[var(--bg2)] cursor-pointer hover:border-[var(--accent)] overflow-hidden min-w-0"
                  >
                    {hasMedia && (
                      <span className="w-[22px] h-[22px] rounded overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={value} alt="" className="w-full h-full object-cover" />
                      </span>
                    )}
                    <span className="truncate">{hasMedia ? '✓ Change file' : '⬆ Upload file'}</span>
                  </button>
                  <input
                    ref={el => { fileInputRefs.current[key] = el; }}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => setVariable(key, ev.target?.result as string);
                      reader.readAsDataURL(file);
                    }}
                  />
                </>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteVariable(key)}
                className="bg-transparent border-none text-[var(--text2)] cursor-pointer text-base leading-none px-[2px] hover:text-[var(--tag-h)] flex-shrink-0"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
