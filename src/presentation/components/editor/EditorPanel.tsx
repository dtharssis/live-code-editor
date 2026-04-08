'use client';

import dynamic from 'next/dynamic';
import { useStore } from '../../store';
import { Badge } from '../ui/Badge';

const CodeEditor = dynamic(
  () => import('./CodeEditor').then(m => m.CodeEditor),
  { ssr: false },
);

interface EditorPanelProps {
  isDark: boolean;
}

function getFileLang(filename: string): 'liquid-markup' | 'css' | 'js' {
  if (filename.endsWith('.liquid')) return 'liquid-markup';
  if (filename.endsWith('.css'))    return 'css';
  return 'js';
}

function getFileBadgeVariant(filename: string): 'liquid' | 'css' | 'js' {
  if (filename.endsWith('.liquid')) return 'liquid';
  if (filename.endsWith('.css'))    return 'css';
  return 'js';
}

export function EditorPanel({ isDark }: EditorPanelProps) {
  const activeFile       = useStore(s => s.activeFile);
  const files            = useStore(s => s.files);
  const updateFileContent = useStore(s => s.updateFileContent);
  const openModal        = useStore(s => s.openModal);

  const content = files[activeFile] ?? '';
  const lang    = getFileLang(activeFile);
  const badge   = getFileBadgeVariant(activeFile);
  const isLiquid = activeFile.endsWith('.liquid');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      {/* File tab header */}
      <div style={{
        height: 36, display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px',
        background: 'var(--surface2, #1a1a2a)',
        borderBottom: '1px solid var(--border, rgba(65,73,63,0.15))',
        flexShrink: 0,
      }}>
        <Badge variant={badge}>{activeFile}</Badge>

        {isLiquid && (
          <button
            onClick={() => openModal('variables')}
            style={{
              marginLeft: 'auto',
              fontSize: 10, fontWeight: 600, padding: '2px 9px',
              borderRadius: 4, border: '1px solid rgba(203,166,247,0.3)',
              background: 'rgba(203,166,247,0.1)', color: 'var(--tag-l, #cba6f7)',
              cursor: 'pointer',
            }}
          >
            {'{{ }} Variables'}
          </button>
        )}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <CodeEditor
          key={activeFile}
          lang={lang}
          value={content}
          onChange={val => updateFileContent(activeFile, val)}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
