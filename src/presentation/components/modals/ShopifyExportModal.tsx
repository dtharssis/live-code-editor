'use client';

import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { ZipJSZipAdapter } from '../../../infrastructure/adapters/ZipJSZipAdapter';
import { ExportShopifyUseCase } from '../../../application/use-cases/ExportShopifyUseCase';

const zip      = new ZipJSZipAdapter();
const useCase  = new ExportShopifyUseCase(zip);

function slugify(s: string) {
  return (s || 'component').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'component';
}

export function ShopifyExportModal() {
  const activeModal = useStore(s => s.activeModal);
  const closeModal  = useStore(s => s.closeModal);
  const files       = useStore(s => s.files);
  const variables   = useStore(s => s.variables);

  const markup = Object.entries(files).filter(([n]) => n.endsWith('.liquid')).map(([,c]) => c).join('\n');
  const css    = Object.entries(files).filter(([n]) => n.endsWith('.css')).map(([,c]) => c).join('\n');
  const js     = Object.entries(files).filter(([n]) => n.endsWith('.js')).map(([,c]) => c).join('\n');

  const [raw, setRaw] = useState('');
  const slug = slugify(raw);
  const name = `livecode-${slug}`;
  const hasJs = js.trim().length > 0;

  useEffect(() => { if (activeModal === 'shopify-export') setRaw(''); }, [activeModal]);

  const confirm = async () => {
    await useCase.execute(name, markup, css, js, variables);
    closeModal();
  };

  return (
    <Modal
      open={activeModal === 'shopify-export'}
      onClose={closeModal}
      title="↙ Export Shopify Section"
      titleClassName="text-[var(--tag-l)]"
    >
      <div className="px-4 py-4 flex flex-col gap-4">

        {/* Name */}
        <section className="flex flex-col gap-[6px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[var(--text2)]">Component name</div>
          <div className="flex items-center border border-[var(--border)] rounded-md overflow-hidden bg-[var(--bg2)] focus-within:border-[var(--tag-l)]">
            <span className="px-[10px] py-2 text-[12px] font-mono text-[var(--tag-l)] bg-[rgba(203,166,247,0.1)] border-r border-[var(--border)] whitespace-nowrap">
              livecode-
            </span>
            <input
              value={raw}
              onChange={e => setRaw(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
              placeholder="product-card"
              spellCheck={false}
              autoFocus
              className="flex-1 px-[10px] py-2 text-[13px] font-mono border-none bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--text2)]"
            />
          </div>
          <div className="text-[11px] text-[var(--text2)]">Lowercase letters, numbers and hyphens only.</div>
        </section>

        {/* File tree */}
        <section className="flex flex-col gap-[6px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[var(--text2)]">Files that will be generated</div>
          <FileTree name={name} hasJs={hasJs} />
        </section>

        {/* Steps */}
        <section className="flex flex-col gap-[6px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[var(--text2)]">How to install</div>
          <ol className="pl-[18px] flex flex-col gap-[5px] list-decimal">
            {[
              'Unzip the downloaded file',
              `Copy sections/${name}.liquid → theme sections/`,
              'Copy assets/* → theme assets/',
              'Shopify Admin → Online Store → Themes → Customize',
              'Add the section to any template page',
            ].map(s => (
              <li key={s} className="text-[12px] text-[var(--text2)] leading-[1.5]">{s}</li>
            ))}
          </ol>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={closeModal} className="text-[12px] px-[14px] py-[5px] rounded border border-[var(--border)] bg-[var(--surface2)] text-[var(--text)] cursor-pointer hover:border-[var(--accent)]">Cancel</button>
          <button onClick={confirm}    className="text-[12px] px-[14px] py-[5px] rounded border border-[var(--accent)] bg-[var(--accent)] text-[#1e1e2e] font-semibold cursor-pointer hover:opacity-90">↙ Download .zip</button>
        </div>
      </div>
    </Modal>
  );
}

function FileTree({ name, hasJs }: { name: string; hasJs: boolean }) {
  const Icon = ({ label, cls }: { label: string; cls: string }) => (
    <span className={`text-[10px] font-bold px-[5px] py-[1px] rounded font-mono min-w-[28px] text-center ${cls}`}>{label}</span>
  );
  return (
    <div className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-[10px] flex flex-col gap-[5px]">
      <Row indent icon={<span className="text-sm">📁</span>} label="sections/" />
      <Row indent2 icon={<Icon label="{%}" cls="bg-[rgba(203,166,247,0.15)] text-[var(--tag-l)]" />} label={`${name}.liquid`} note="Template + schema" />
      <Row indent icon={<span className="text-sm">📁</span>} label="assets/" />
      <Row indent2 icon={<Icon label=".css" cls="bg-[rgba(137,180,250,0.15)] text-[var(--tag-c)]" />} label={`${name}.css`} note="Section styles" />
      {hasJs && <Row indent2 icon={<Icon label=".js" cls="bg-[rgba(249,226,175,0.15)] text-[var(--tag-j)]" />} label={`${name}.js`} note="Section scripts" />}
      <Row icon={<Icon label="md" cls="bg-[rgba(166,227,161,0.15)] text-[var(--green)]" />} label="README.md" note="Install instructions" />
    </div>
  );
}

function Row({ icon, label, note, indent, indent2 }: { icon: React.ReactNode; label: string; note?: string; indent?: boolean; indent2?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[12px] ${indent ? 'pl-5' : ''} ${indent2 ? 'pl-9' : ''}`}>
      {icon}
      <span className="font-mono text-[var(--text)] flex-1">{label}</span>
      {note && <span className="text-[10px] text-[var(--text2)]">{note}</span>}
    </div>
  );
}
