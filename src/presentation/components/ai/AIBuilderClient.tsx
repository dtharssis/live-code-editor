'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { PLANS, PlanKey } from '../../constants/plans';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CodeEditor } from '../editor/CodeEditor';
import { LiquidRendererService } from '@/application/services/LiquidRendererService';
import { DEFAULT_FILES, DEFAULT_VARIABLES } from '../../constants/defaultProjects';
import { createComponent } from '@/lib/actions/components';
import { CustomizerPanel } from '../preview/CustomizerPanel';

const CodeEditorDynamic = dynamic(
  () => import('../editor/CodeEditor').then(m => m.CodeEditor),
  { ssr: false },
);

interface Message {
  role: 'user' | 'ai';
  content: string;
  progress?: number;
  tags?: string[];
  codeUpdated?: boolean;
}

interface AIBuilderClientProps {
  planKey:        PlanKey;
  aiRequestsUsed: number;
  canUseAI:       boolean;
  isNew?:         boolean;
  isContinue?:    boolean;
}

interface ContinuePayload {
  liquid:  string;
  css:     string;
  js:      string;
  name:    string;
  fromAI:  boolean;
}

interface GeneratedBundle {
  liquid: string;
  css:    string;
  js:     string;
  // snippets keyed by filename e.g. "snippets/card.liquid"
  snippets?: Record<string, string>;
}

type ModalTreePath = string; // dynamic paths

const SAMPLE_BUNDLE: GeneratedBundle = {
  liquid: DEFAULT_FILES['dynamic-hero.liquid'],
  css:    DEFAULT_FILES['theme.css'],
  js:     DEFAULT_FILES['theme.js'],
};

const PREVIEW_RENDERER = new LiquidRendererService();

function renderBundlePreview(bundle: GeneratedBundle): string {
  const rendered = PREVIEW_RENDERER.render(bundle.liquid || '', DEFAULT_VARIABLES.values);
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>${bundle.css || ''}</style></head><body>${rendered}<script>${bundle.js || ''}</script></body></html>`;
}

function getAIConfigFromStorage(): { provider?: string; model?: string; apiKey?: string } {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem('livecode:ai-config');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if ('defaultProvider' in parsed) {
      const p    = parsed.defaultProvider as string;
      const pcfg = parsed[p] as { model: string; apiKey: string };
      return { provider: p, model: pcfg?.model, apiKey: pcfg?.apiKey };
    }
    if ('provider' in parsed) return { provider: parsed.provider, model: parsed.model, apiKey: parsed.apiKey };
  } catch { /* ignore */ }
  return {};
}

// ── Save Modal ──────────────────────────────────────────────────────────────────

function SaveModal({ bundle, onClose }: { bundle: GeneratedBundle; onClose: () => void }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim()) return;
    setStatus('saving');
    startTransition(async () => {
      try {
        await createComponent({
          name:       name.trim(),
          liquidCode: bundle.liquid,
          cssCode:    bundle.css,
          jsCode:     bundle.js,
          method:     'AI_GENERATED',
        });
        setStatus('saved');
        setTimeout(() => onClose(), 1200);
      } catch (err) {
        console.error(err);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 900, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 901, width: 420, background: '#1e1e2e',
        border: '1px solid rgba(65,73,63,0.25)', borderRadius: 14,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(65,73,63,0.12)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e3e0f7', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}>Save Component</div>
          <div style={{ fontSize: 12, color: '#8b9387', marginTop: 3 }}>Save to your Drafts library</div>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: 8 }}>Component Name</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Hero Section"
            style={{
              width: '100%', padding: '10px 14px', background: '#121221',
              border: '1px solid rgba(65,73,63,0.2)', borderRadius: 8,
              color: '#e3e0f7', fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isPending}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: status === 'saved' ? '#1a2d1e' : status === 'error' ? 'rgba(255,100,100,0.2)' : 'linear-gradient(135deg,#c5ffbf,#a6e3a1)',
              color: status === 'saved' ? '#a6e3a1' : status === 'error' ? '#ffb4ab' : '#00390c',
              fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
              opacity: !name.trim() || isPending ? 0.5 : 1,
            }}
          >
            {status === 'saved' ? '✓ Saved!' : status === 'saving' ? 'Saving...' : status === 'error' ? 'Error — retry' : 'Save to Drafts'}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Image Upload Button ─────────────────────────────────────────────────────────

function ImageUploadButton({ onImage }: { onImage: (dataUrl: string, name: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImage(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleChange} />
      <button
        title="Upload image for reference"
        onClick={() => ref.current?.click()}
        style={{ padding: '5px 8px', background: 'transparent', border: '1px solid rgba(65,73,63,0.2)', borderRadius: 6, cursor: 'pointer', color: '#8b9387', lineHeight: 1, display: 'flex', alignItems: 'center' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      </button>
    </>
  );
}

// ── Build explorer tree from bundle ────────────────────────────────────────────

type TreeFile = { path: ModalTreePath; label: string; dir: string };

function buildTree(bundle: GeneratedBundle): TreeFile[] {
  const files: TreeFile[] = [
    { path: 'sections/generated-section.liquid', label: 'generated-section.liquid', dir: 'Sections' },
  ];
  if (bundle.snippets) {
    for (const key of Object.keys(bundle.snippets)) {
      const label = key.replace('snippets/', '');
      files.push({ path: key, label, dir: 'Snippets' });
    }
  } else {
    files.push({ path: 'snippets/generated-snippet.liquid', label: 'generated-snippet.liquid', dir: 'Snippets' });
  }
  files.push(
    { path: 'assets/theme.css', label: 'theme.css', dir: 'Assets' },
    { path: 'assets/theme.js',  label: 'theme.js',  dir: 'Assets' },
  );
  return files;
}

function getFileCode(bundle: GeneratedBundle, snippetCode: string, path: ModalTreePath): string {
  if (path === 'sections/generated-section.liquid') return bundle.liquid;
  if (path === 'assets/theme.css')  return bundle.css;
  if (path === 'assets/theme.js')   return bundle.js;
  if (bundle.snippets?.[path] !== undefined) return bundle.snippets[path];
  return snippetCode;
}

function getLang(path: string): 'liquid-markup' | 'css' | 'js' {
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.js'))  return 'js';
  return 'liquid-markup';
}

// ── Main Component ──────────────────────────────────────────────────────────────

export function AIBuilderClient({ planKey, aiRequestsUsed, canUseAI, isNew, isContinue }: AIBuilderClientProps) {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState('');
  const [generating, setGenerating] = useState(false);
  const [viewport, setViewport]     = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewHtml, setPreviewHtml]     = useState(() => (isNew || isContinue) ? '' : renderBundlePreview(SAMPLE_BUNDLE));
  const [generatedBundle, setGeneratedBundle] = useState<GeneratedBundle | null>(null);
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [codeModalPath, setCodeModalPath] = useState<ModalTreePath>('sections/generated-section.liquid');
  const [editableBundle, setEditableBundle]   = useState<GeneratedBundle>({ liquid: '', css: '', js: '' });
  const [editableSnippet, setEditableSnippet] = useState('');
  const [modalPreviewHtml, setModalPreviewHtml] = useState('');
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({ Sections: true, Snippets: true, Assets: true });
  const [modalAutoRun, setModalAutoRun]       = useState(true);
  const [customizerOpen, setCustomizerOpen]   = useState(false);
  const [customizerVars, setCustomizerVars]   = useState<Record<string, string>>({});
  const modalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Uploaded reference images: { name, dataUrl }
  const [refImages, setRefImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const plan      = PLANS[planKey];
  const limit     = plan.aiRequestsPerMonth;
  const remaining = limit === Infinity ? '∞' : Math.max(0, limit - aiRequestsUsed);
  const currentBundle = generatedBundle ?? ((isNew || isContinue) ? { liquid: '', css: '', js: '' } : SAMPLE_BUNDLE);

  // Load draft from sessionStorage when coming from Drafts "Continue with AI"
  useEffect(() => {
    if (!isContinue) return;
    try {
      const raw = window.sessionStorage.getItem('livecode:ai-continue');
      if (!raw) return;
      window.sessionStorage.removeItem('livecode:ai-continue');
      const payload = JSON.parse(raw) as ContinuePayload;
      const bundle: GeneratedBundle = { liquid: payload.liquid, css: payload.css, js: payload.js };
      setGeneratedBundle(bundle);
      setPreviewHtml(renderBundlePreview(bundle));
      // Seed chat with a context message
      const intro: Message = {
        role: 'ai',
        content: payload.fromAI
          ? `Loaded **${payload.name}** (previously AI-generated). I have the full code context — just tell me what to change.`
          : `Loaded **${payload.name}** (manual draft). I can see the code — describe any changes or improvements you'd like.`,
      };
      setMessages([intro]);
    } catch { /* ignore malformed payload */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Build context string from current bundle to send to AI
  function buildCodeContext(): string {
    // generatedBundle is set by the isContinue useEffect before user can interact
    const b = generatedBundle ?? (isNew ? null : SAMPLE_BUNDLE);
    if (!b) return '';
    const parts = [`CURRENT COMPONENT CODE (read this before responding):\n`];
    parts.push(`--- sections/generated-section.liquid ---\n${b.liquid}`);
    if (b.css) parts.push(`\n--- assets/theme.css ---\n${b.css}`);
    if (b.js)  parts.push(`\n--- assets/theme.js ---\n${b.js}`);
    if (b.snippets) {
      for (const [k, v] of Object.entries(b.snippets)) {
        parts.push(`\n--- ${k} ---\n${v}`);
      }
    }
    return parts.join('\n');
  }

  const handleGenerate = async () => {
    if (!input.trim() || generating || !canUseAI) return;

    const imageContext = refImages.length > 0
      ? `\n\n[Reference images uploaded: ${refImages.map(i => i.name).join(', ')}. Use them as visual inspiration for colors, layout, and style.]`
      : '';

    const codeContext     = buildCodeContext();
    const hasExistingCode = !!codeContext;
    const fullPrompt      = codeContext
      ? `${codeContext}\n\nUSER REQUEST: ${input}${imageContext}`
      : `${input}${imageContext}`;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setGenerating(true);
    const aiMsg: Message = {
      role: 'ai',
      content: 'Working...',
      progress: 0,
      tags: hasExistingCode ? ['reading code', 'editing', 'updating preview'] : ['sections/', 'assets/', 'schema'],
    };
    setMessages(prev => [...prev, aiMsg]);

    // Progress animation
    for (let p = 10; p <= 90; p += 10) {
      await new Promise(r => setTimeout(r, 180));
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { ...aiMsg, progress: p };
        return next;
      });
    }

    try {
      const { provider, model, apiKey } = getAIConfigFromStorage();
      const res  = await fetch('/api/ai/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: fullPrompt, provider, model, apiKey }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'ai', content: `⚠️ ${data.error ?? `Server error ${res.status}`}` };
          return next;
        });
      } else {
        const codeUpdated = data.liquid !== null || data.css !== null || data.js !== null;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'ai',
            content: data.message ?? (codeUpdated ? 'Done — canvas updated.' : 'Got it.'),
            codeUpdated,
          };
          return next;
        });
        if (codeUpdated) {
          const nextBundle: GeneratedBundle = {
            liquid:   typeof data.liquid   === 'string' ? data.liquid   : '',
            css:      typeof data.css      === 'string' ? data.css      : '',
            js:       typeof data.js       === 'string' ? data.js       : '',
            snippets: typeof data.snippets === 'object' && data.snippets ? data.snippets : undefined,
          };
          setGeneratedBundle(nextBundle);
          setPreviewHtml(renderBundlePreview(nextBundle));
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'ai', content: `⚠️ ${msg}` };
        return next;
      });
    }

    setGenerating(false);
  };

  function handleNewConversation() {
    setMessages([]);
    setGeneratedBundle(null);
    setPreviewHtml('');
    setRefImages([]);
    setInput('');
    setCustomizerVars({});
  }

  function handleCustomizerChange(key: string, value: string) {
    setCustomizerVars(prev => {
      const next = { ...prev, [key]: value };
      // Re-render preview with customizer values merged into the bundle
      const b = generatedBundle ?? (isNew ? null : SAMPLE_BUNDLE);
      if (b) {
        const rendered = PREVIEW_RENDERER.render(b.liquid || '', next);
        const html = `<!doctype html><html><head><meta charset="utf-8"/><style>${b.css || ''}</style></head><body>${rendered}<script>${b.js || ''}</script></body></html>`;
        setPreviewHtml(html);
      }
      return next;
    });
  }

  const handleOpenEditCodeModal = () => {
    setEditableBundle(currentBundle);
    const snippetMatches = Array.from(currentBundle.liquid.matchAll(/\{%-?\s*render\s+['"]([^'"]+)['"]/g)).map(m => m[1]);
    setEditableSnippet(
      snippetMatches.length > 0
        ? `{% comment %}\nReferenced snippets:\n${snippetMatches.map(n => `- snippets/${n}.liquid`).join('\n')}\n{% endcomment %}\n`
        : `{% comment %}\nNo snippets referenced.\n{% endcomment %}\n`,
    );
    setModalPreviewHtml(renderBundlePreview(currentBundle));
    setCodeModalPath('sections/generated-section.liquid');
    setCodeModalOpen(true);
  };

  const handleRunModalPreview = () => { setModalPreviewHtml(renderBundlePreview(editableBundle)); };

  // Auto-run modal preview on code change
  useEffect(() => {
    if (!codeModalOpen || !modalAutoRun) return;
    if (modalDebounceRef.current) clearTimeout(modalDebounceRef.current);
    modalDebounceRef.current = setTimeout(() => {
      setModalPreviewHtml(renderBundlePreview(editableBundle));
    }, 600);
    return () => { if (modalDebounceRef.current) clearTimeout(modalDebounceRef.current); };
  }, [editableBundle, codeModalOpen, modalAutoRun]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateModalFile = (path: ModalTreePath, content: string) => {
    if (path === 'sections/generated-section.liquid') {
      setEditableBundle(prev => ({ ...prev, liquid: content }));
    } else if (path === 'assets/theme.css') {
      setEditableBundle(prev => ({ ...prev, css: content }));
    } else if (path === 'assets/theme.js') {
      setEditableBundle(prev => ({ ...prev, js: content }));
    } else if (path.startsWith('snippets/')) {
      setEditableBundle(prev => ({ ...prev, snippets: { ...(prev.snippets ?? {}), [path]: content } }));
    } else {
      setEditableSnippet(content);
    }
  };

  const treeFiles   = buildTree(editableBundle.liquid ? editableBundle : currentBundle);
  const activeCode  = getFileCode(editableBundle, editableSnippet, codeModalPath);
  const activeLang  = getLang(codeModalPath);

  const dirs = Array.from(new Set(treeFiles.map(f => f.dir)));

  const viewportWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? 'min(768px,100%)' : 'min(390px,100%)';

  const hasGenerated = !!generatedBundle;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#121221', overflow: 'hidden', margin: '-2rem', maxWidth: 'calc(100% + 4rem)' }}>

      {/* ── Left: Chat ───────────────────────────────────────────────── */}
      <div style={{ width: 'clamp(300px, 30vw, 400px)', borderRight: '1px solid rgba(65,73,63,0.15)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(65,73,63,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, color: '#c5ffbf' }}>✦</span>
              <h2 style={{ fontFamily: 'Space Grotesk, system-ui, sans-serif', fontWeight: 700, fontSize: 16, margin: 0, color: '#e3e0f7' }}>AI Component Builder</h2>
            </div>
            <a
              href="/ai-builder?new=1"
              title="New conversation"
              style={{ fontSize: 11, fontWeight: 600, color: '#8b9387', background: '#1a1a2a', border: '1px solid rgba(65,73,63,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', textDecoration: 'none' }}
            >
              ＋ New
            </a>
          </div>
          <p style={{ fontSize: 11, color: '#8b9387', margin: 0 }}>
            {messages.length === 0
              ? 'Describe a component or paste code. The AI edits the canvas — chat stays clean.'
              : hasGenerated
                ? 'AI has the full code context. Just tell it what to change.'
                : 'Describe your Shopify section. The AI will build it on the canvas.'}
          </p>
          {limit !== Infinity && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 3, background: '#1e1e2e', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(aiRequestsUsed / limit) * 100}%`, background: aiRequestsUsed / limit > 0.8 ? '#ffb4ab' : '#c5ffbf', borderRadius: 999, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, color: '#8b9387', whiteSpace: 'nowrap' }}>{remaining} left</span>
            </div>
          )}
        </div>

        {/* Limit banner */}
        {!canUseAI && (
          <div style={{ padding: '10px 20px', background: 'rgba(255,180,171,0.08)', borderBottom: '1px solid rgba(255,180,171,0.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#ffb4ab', marginBottom: 4 }}>AI limit reached for {plan.name} plan</div>
            <Link href="#" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8, textDecoration: 'none' }}>Upgrade Plan</Link>
          </div>
        )}

        {/* Reference images */}
        {refImages.length > 0 && (
          <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(65,73,63,0.08)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {refImages.map((img, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={img.dataUrl} alt={img.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(65,73,63,0.2)' }} />
                <button
                  onClick={() => setRefImages(prev => prev.filter((_, j) => j !== i))}
                  style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#333344', border: 'none', cursor: 'pointer', fontSize: 9, color: '#e3e0f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
          {messages.length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 13, color: '#8b9387', lineHeight: 1.6 }}>
                Describe a Shopify section to get started.<br />
                <span style={{ fontSize: 11, color: '#41493f' }}>The AI understands sections, snippets, and assets.</span>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(65,73,63,0.1)' }}>
          <div style={{ background: '#0d0d1c', border: '1px solid rgba(65,73,63,0.15)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
              placeholder={hasGenerated ? 'Ask a change, e.g. "add image schema" or "change background to navy"...' : 'Describe the Shopify component you want to build...'}
              disabled={!canUseAI || generating}
              rows={3}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 13, color: '#e3e0f7', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: 1.6 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <ImageUploadButton onImage={(dataUrl, name) => setRefImages(prev => [...prev, { dataUrl, name }])} />
              <button
                onClick={handleGenerate}
                disabled={!canUseAI || generating || !input.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: canUseAI && input.trim() ? 'linear-gradient(135deg,#c5ffbf,#a6e3a1)' : '#292839',
                  color: canUseAI && input.trim() ? '#00390c' : '#41493f',
                  fontSize: 12, fontWeight: 700, transition: 'all 0.15s', opacity: generating ? 0.7 : 1,
                }}
              >
                {generating ? '...' : '↑ Generate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Preview ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{
          height: 56, background: 'rgba(13,13,28,0.9)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(65,73,63,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c5ffbf', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e3e0f7' }}>Live Preview</span>
            </div>
            <div style={{ display: 'flex', background: '#0d0d1c', borderRadius: 8, padding: 3, gap: 2 }}>
              {(['desktop', 'tablet', 'mobile'] as const).map(v => (
                <button key={v} onClick={() => setViewport(v)} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 11, transition: 'all 0.15s',
                  background: viewport === v ? '#333344' : 'transparent',
                  color: viewport === v ? '#c5ffbf' : '#8b9387',
                }}>
                  {v === 'desktop' ? '🖥' : v === 'tablet' ? '📱' : '📲'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setCustomizerOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', background: customizerOpen ? '#292839' : 'transparent', color: customizerOpen ? '#c5ffbf' : '#8b9387', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
              title="Toggle Customizer"
            >
              ⚙ Settings
            </button>
            <button
              onClick={handleOpenEditCodeModal}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', background: '#333344', color: '#e3e0f7', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
            >
              {'</>'} Edit Code
            </button>
            <button
              onClick={() => setSaveModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              ↓ Save
            </button>
          </div>
        </div>

        {/* Canvas + Customizer */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto', background: '#0d0d1c' }}>
            {previewHtml ? (
              <div style={{ width: viewportWidth, maxWidth: '100%', background: '#1e1e2e', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', minHeight: 500, transition: 'width 0.3s' }}>
                <iframe srcDoc={previewHtml} style={{ width: '100%', height: 600, border: 'none', display: 'block', background: '#fff' }} sandbox="allow-scripts" title="AI Component Preview" />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, height: '100%', minHeight: 300, color: '#41493f' }}>
                <span style={{ fontSize: 48, opacity: 0.3 }}>✦</span>
                <div style={{ fontSize: 13, color: '#41493f', textAlign: 'center', lineHeight: 1.7 }}>
                  Describe a Shopify section in the chat<br />
                  <span style={{ fontSize: 11 }}>The preview will appear here after generation</span>
                </div>
              </div>
            )}
          </div>
          {customizerOpen && (
            <CustomizerPanel
              liquidCode={currentBundle.liquid}
              currentVars={customizerVars}
              onSettingChange={handleCustomizerChange}
            />
          )}
        </div>

        {/* Status bar */}
        <div style={{ padding: '8px 20px', background: '#0d0d1c', borderTop: '1px solid rgba(65,73,63,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#41493f' }}>
            {hasGenerated
              ? <span><span style={{ color: '#c5ffbf' }}>●</span> Component loaded · {messages.filter(m => m.role === 'user').length} turn{messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''}</span>
              : <span>Sample preview — generate a component to replace it</span>}
          </div>
          {hasGenerated && (
            <button onClick={() => setSaveModalOpen(true)} style={{ fontSize: 11, color: '#c5ffbf', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Save to Drafts →</button>
          )}
        </div>
      </div>

      {/* ── Edit Code Modal ──────────────────────────────────────────── */}
      {codeModalOpen && (
        <>
          <div onClick={() => setCodeModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 600 }} />
          <div style={{ position: 'fixed', inset: 24, zIndex: 601, background: '#121221', border: '1px solid rgba(65,73,63,0.2)', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: 56, borderBottom: '1px solid rgba(65,73,63,0.12)', background: '#0f0f1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#e3e0f7' }}>AI Generated Component</div>
                <div style={{ fontSize: 11, color: '#8b9387' }}>Edit code — preview updates {modalAutoRun ? 'automatically' : 'on Run'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b9387', fontSize: 12, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={modalAutoRun}
                    onChange={e => setModalAutoRun(e.target.checked)}
                    style={{ accentColor: '#c5ffbf' }}
                  />
                  Auto-run
                </label>
                <button onClick={handleRunModalPreview} style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>▶ Run</button>
                <button
                  onClick={() => { setCodeModalOpen(false); setSaveModalOpen(true); }}
                  style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#c5ffbf,#a6e3a1)', color: '#00390c', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >↓ Save</button>
                <button onClick={() => setCodeModalOpen(false)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(65,73,63,0.2)', background: '#333344', color: '#e3e0f7', fontSize: 12, cursor: 'pointer' }}>Close</button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
              {/* File tree */}
              <div style={{ width: 220, borderRight: '1px solid rgba(65,73,63,0.12)', background: '#111120', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '10px 14px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#41493f', borderBottom: '1px solid rgba(65,73,63,0.1)' }}>Explorer</div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                  {dirs.map(dir => (
                    <div key={dir}>
                      <button
                        onClick={() => setExpandedDirs(prev => ({ ...prev, [dir]: !prev[dir] }))}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'transparent', border: 'none', color: '#c1c9bc', fontSize: 12, fontWeight: 500, textAlign: 'left', cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: 9, color: '#41493f', transform: expandedDirs[dir] ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
                        {dir}
                      </button>
                      {expandedDirs[dir] && treeFiles.filter(f => f.dir === dir).map(file => {
                        const active = codeModalPath === file.path;
                        return (
                          <button
                            key={file.path}
                            onClick={() => setCodeModalPath(file.path)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '4px 14px 4px 26px', border: 'none', textAlign: 'left', cursor: 'pointer', background: active ? 'rgba(203,166,247,0.1)' : 'transparent', borderLeft: active ? '2px solid rgba(203,166,247,0.6)' : '2px solid transparent' }}
                          >
                            <span style={{ fontSize: 9, fontWeight: 800, color: file.label.endsWith('.css') ? '#89b4fa' : file.label.endsWith('.js') ? '#f9e2af' : '#cba6f7', fontFamily: 'monospace' }}>
                              {file.label.endsWith('.css') ? '#' : file.label.endsWith('.js') ? 'JS' : '{}'}
                            </span>
                            <span style={{ fontSize: 12, fontFamily: 'monospace', color: active ? '#d8c4ff' : '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(65,73,63,0.12)' }}>
                <div style={{ height: 40, borderBottom: '1px solid rgba(65,73,63,0.12)', background: '#0f0f1e', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#c1c9bc' }}>{codeModalPath}</span>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <CodeEditor lang={activeLang} value={activeCode} onChange={val => updateModalFile(codeModalPath, val)} isDark />
                </div>
              </div>

              {/* Preview */}
              <div style={{ width: '45%', minWidth: 380, background: '#0d0d1c', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 40, borderBottom: '1px solid rgba(65,73,63,0.12)', background: '#0f0f1e', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b9387' }}>Live Preview</span>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  <iframe srcDoc={modalPreviewHtml} style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fff' }} sandbox="allow-scripts" title="AI Generated Editable Preview" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Save Modal ───────────────────────────────────────────────── */}
      {saveModalOpen && (
        <SaveModal bundle={editableBundle.liquid ? editableBundle : currentBundle} onClose={() => setSaveModalOpen(false)} />
      )}
    </div>
  );
}

function ChatBubble({ msg }: { msg: Message }) {
  const isAI = msg.role === 'ai';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isAI ? 'flex-start' : 'flex-end', marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#41493f', marginBottom: 5 }}>
        {isAI ? '✦ LIQUIDFLOW AI' : 'YOU'}
      </div>
      <div style={{
        maxWidth: '85%', padding: '10px 14px', borderRadius: isAI ? '0 12px 12px 12px' : '12px 0 12px 12px',
        background: isAI ? '#292839' : '#a6e3a1', color: isAI ? '#e3e0f7' : '#00390c',
        fontSize: 13, lineHeight: 1.6,
      }}>
        {msg.progress !== undefined && msg.progress < 100 ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b9387' }}>
              <span>Editing code</span>
              <span style={{ color: '#c5ffbf', fontFamily: 'monospace' }}>{msg.progress}%</span>
            </div>
            <div style={{ height: 4, background: '#0d0d1c', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${msg.progress}%`, background: 'linear-gradient(90deg,#c5ffbf,#a6e3a1)', borderRadius: 999, boxShadow: '0 0 8px rgba(197,255,191,0.4)', transition: 'width 0.2s' }} />
            </div>
            {msg.tags && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {msg.tags.map((tag, i) => (
                  <span key={tag} style={{ fontSize: 10, background: '#1e1e2e', borderRadius: 999, padding: '2px 8px', color: i === msg.tags!.length - 1 ? '#c5ffbf' : '#8b9387', fontFamily: 'monospace' }}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {msg.content}
            {msg.codeUpdated && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c5ffbf', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b9387' }}>canvas updated</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
