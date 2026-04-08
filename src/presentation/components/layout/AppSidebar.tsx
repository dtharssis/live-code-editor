'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { PLANS, PlanKey } from '../../constants/plans';
import { EXPLORER_FOLDERS } from '../../constants/defaultProjects';
import { useStore } from '../../store';
import { C, R, F, btnPrimary, btnSecondary, card, sectionLabel } from '../../constants/tokens';

// ── AI Config types (shared with AIBuilderClient via localStorage) ────────────

export type AIProvider = 'openai' | 'claude';

export interface AIProviderConfig {
  apiKey: string;
  model:  string;
}

export interface AIFullConfig {
  defaultProvider: AIProvider;
  openai:          AIProviderConfig;
  claude:          AIProviderConfig;
}

/** Legacy flat shape — provider/model/apiKey — used by AIBuilderClient */
export interface AIConfig {
  provider: AIProvider;
  model:    string;
  apiKey:   string;
}

export const OPENAI_MODELS = [
  { id: 'gpt-4o',       label: 'GPT-4o (recommended)' },
  { id: 'gpt-4o-mini',  label: 'GPT-4o mini (fast)' },
  { id: 'gpt-4-turbo',  label: 'GPT-4 Turbo' },
  { id: 'o1-mini',      label: 'o1-mini (reasoning)' },
];

export const CLAUDE_MODELS = [
  { id: 'claude-opus-4-6',           label: 'Claude Opus 4.6 (most capable)' },
  { id: 'claude-sonnet-4-6',         label: 'Claude Sonnet 4.6 (recommended)' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (fast)' },
];

export const AI_CONFIG_KEY = 'livecode:ai-config';

const DEFAULT_FULL: AIFullConfig = {
  defaultProvider: 'openai',
  openai:  { apiKey: '', model: 'gpt-4o' },
  claude:  { apiKey: '', model: 'claude-sonnet-4-6' },
};

export function getAIFullConfig(): AIFullConfig {
  if (typeof window === 'undefined') return DEFAULT_FULL;
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return DEFAULT_FULL;
    const parsed = JSON.parse(raw);
    // Detect legacy flat shape { provider, model, apiKey } and migrate
    if ('provider' in parsed && !('defaultProvider' in parsed)) {
      const legacy = parsed as AIConfig;
      return {
        ...DEFAULT_FULL,
        defaultProvider: legacy.provider,
        [legacy.provider]: { apiKey: legacy.apiKey, model: legacy.model },
      };
    }
    return { ...DEFAULT_FULL, ...parsed };
  } catch {
    return DEFAULT_FULL;
  }
}

/** Returns the flat AIConfig shape used by AIBuilderClient */
export function getAIConfig(): AIConfig | null {
  const full = getAIFullConfig();
  const p    = full.defaultProvider;
  const cfg  = full[p];
  if (!cfg.apiKey) return null;
  return { provider: p, model: cfg.model, apiKey: cfg.apiKey };
}

// ── Settings Modal ─────────────────────────────────────────────────────────────

function AISettingsModal({ onClose }: { onClose: () => void }) {
  const [config, setConfig]     = useState<AIFullConfig>(() => getAIFullConfig());
  const [activeTab, setActiveTab] = useState<AIProvider>(config.defaultProvider);
  const [savedTab, setSavedTab]  = useState<AIProvider | null>(null);

  const models = activeTab === 'openai' ? OPENAI_MODELS : CLAUDE_MODELS;

  function updateProvider(field: keyof AIProviderConfig, value: string) {
    setConfig(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [field]: value } }));
  }

  function handleSave() {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
    setSavedTab(activeTab);
    setTimeout(() => setSavedTab(null), 1500);
  }

  const providerCfg = config[activeTab];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 999, backdropFilter: 'blur(4px)' }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 1000, width: 520, background: C.bgSurface,
        border: `1px solid ${C.border4}`, borderRadius: R.xl,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: F['2xl'], fontWeight: 700, color: C.textPrimary, fontFamily: F.display }}>AI Builder Settings</div>
            <div style={{ fontSize: F.base, color: C.textMuted, marginTop: 2 }}>API keys are stored per-provider and never sent to our servers</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, color: C.textMuted, padding: 4, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Default provider selector */}
          <div>
            <label style={{ ...sectionLabel, display: 'block', marginBottom: 8 }}>
              Default Provider
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['openai', 'claude'] as AIProvider[]).map(p => {
                const isDefault = config.defaultProvider === p;
                const hasKey    = !!config[p].apiKey;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setConfig(prev => ({ ...prev, defaultProvider: p }));
                      setActiveTab(p);
                    }}
                    style={{
                      padding: '12px 16px', borderRadius: R.lg, cursor: 'pointer',
                      border: isDefault ? '1px solid rgba(197,255,191,0.4)' : `1px solid ${C.border3}`,
                      background: isDefault ? 'rgba(197,255,191,0.07)' : C.bgApp,
                      display: 'flex', flexDirection: 'column', gap: 4, textAlign: 'left',
                      transition: 'all 0.15s', position: 'relative',
                    }}
                  >
                    {isDefault && (
                      <span style={{ position: 'absolute', top: 8, right: 10, fontSize: F.xs, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.accentGreen }}>Default</span>
                    )}
                    <span style={{ fontSize: 18 }}>{p === 'openai' ? '⊞' : '✦'}</span>
                    <span style={{ fontSize: F.md, fontWeight: 700, color: isDefault ? C.accentGreen : C.textPrimary }}>
                      {p === 'openai' ? 'OpenAI' : 'Anthropic Claude'}
                    </span>
                    <span style={{ fontSize: F.xs, color: hasKey ? C.accentGreenMd : C.textMuted }}>
                      {hasKey ? '● Key saved' : '○ No key yet'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-provider config tabs */}
          <div>
            <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
              {(['openai', 'claude'] as AIProvider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  style={{
                    flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                    background: activeTab === p ? C.bgElevated : C.bgApp,
                    color: activeTab === p ? C.textPrimary : C.textMuted,
                    fontSize: F.base, fontWeight: 600,
                    borderBottom: activeTab === p ? `2px solid ${C.accentGreen}` : `2px solid ${C.border3}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {p === 'openai' ? 'OpenAI' : 'Claude'}
                  {savedTab === p && <span style={{ marginLeft: 6, color: C.accentGreen, fontSize: F.xs }}>✓</span>}
                </button>
              ))}
            </div>

            <div style={{ background: C.bgElevated, borderRadius: `0 0 ${R.lg}px ${R.lg}px`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Model */}
              <div>
                <label style={{ ...sectionLabel, display: 'block', marginBottom: 6 }}>
                  Model
                </label>
                <select
                  value={providerCfg.model}
                  onChange={e => updateProvider('model', e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', background: C.bgApp,
                    border: `1px solid ${C.border3}`, borderRadius: R.md,
                    color: C.textPrimary, fontSize: F.md, outline: 'none', cursor: 'pointer',
                    appearance: 'none',
                  }}
                >
                  {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>

              {/* API Key */}
              <div>
                <label style={{ ...sectionLabel, display: 'block', marginBottom: 6 }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={providerCfg.apiKey}
                  onChange={e => updateProvider('apiKey', e.target.value)}
                  placeholder={activeTab === 'openai' ? 'sk-...' : 'sk-ant-...'}
                  style={{
                    width: '100%', padding: '9px 12px', background: C.bgApp,
                    border: `1px solid ${C.border3}`, borderRadius: R.md,
                    color: C.textPrimary, fontSize: F.md, outline: 'none',
                    fontFamily: F.mono, boxSizing: 'border-box',
                  }}
                />
                <p style={{ fontSize: F.sm, color: C.textMuted, lineHeight: 1.5, margin: '5px 0 0' }}>
                  {activeTab === 'openai' ? 'Get your key at platform.openai.com' : 'Get your key at console.anthropic.com'}
                </p>
              </div>

              <button
                onClick={handleSave}
                style={{
                  alignSelf: 'flex-end', padding: '7px 18px', borderRadius: R.md, border: 'none', cursor: 'pointer',
                  background: savedTab === activeTab ? '#1a2d1e' : `linear-gradient(135deg,${C.accentGreen},${C.accentGreenMd})`,
                  color: savedTab === activeTab ? C.accentGreenMd : C.onAccent, fontSize: F.base, fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                {savedTab === activeTab ? '✓ Saved' : `Save ${activeTab === 'openai' ? 'OpenAI' : 'Claude'} Config`}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: `1px solid ${C.border2}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: R.md, border: `1px solid ${C.border3}`, background: 'transparent', color: C.textMuted, fontSize: F.md, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

interface AppSidebarProps {
  userName:  string;
  userImage: string | null;
  plan:      string;
}

const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Home',       icon: '⌂' },
  { href: '/editor?new=1',     label: 'Editor',     icon: '</>' },
  { href: '/ai-builder?new=1', label: 'AI Builder', icon: '✦' },
  { href: '/components',       label: 'Components', icon: '◈' },
  { href: '/drafts',           label: 'Drafts',     icon: '◫' },
];

export function AppSidebar({ userName, userImage, plan }: AppSidebarProps) {
  const pathname = usePathname();
  const planData = PLANS[(plan as PlanKey) ?? 'FREE'];
  const isEditorRoute = pathname.startsWith('/editor');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ Sections: true });
  const activeFile = useStore(s => s.activeFile);
  const setActiveFile = useStore(s => s.setActiveFile);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 256,
      background: C.bgBase, borderRight: `1px solid ${C.border2}`,
      display: 'flex', flexDirection: 'column', zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${C.border1}` }}>
        <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: F['4xl'], color: C.accentGreenMd }}>
          Live Code
        </div>
        <div style={{ fontSize: F.sm, color: C.textDisabled, marginTop: 2 }}>Shopify Builder</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const hrefPath = item.href.split('?')[0];
          const isActive = pathname === hrefPath || (hrefPath !== '/dashboard' && pathname.startsWith(hrefPath));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: R.lg, textDecoration: 'none',
                background: isActive ? '#444558' : 'transparent',
                color: isActive ? C.accentGreenMd : `rgba(227,224,247,0.6)`,
                fontSize: F.lg, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: F['2xl'], width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isEditorRoute && (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '2px 12px 10px' }}>
          <div style={{ padding: '10px 2px 8px', fontSize: F.xs, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textMuted }}>
            Explorer
          </div>

          {EXPLORER_FOLDERS.map(folder => (
            <div key={folder.name}>
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [folder.name]: !prev[folder.name] }))}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#cfd6e3',
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 9, color: '#8b9387', transform: expanded[folder.name] ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
                <span style={{ color: expanded[folder.name] ? '#a6e3a1' : '#cfd6e3' }}>▣</span>
                {folder.name}
              </button>

              {expanded[folder.name] && folder.files.map(file => {
                const active = activeFile === file;
                return (
                  <button
                    key={file}
                    onClick={() => setActiveFile(file)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 8px 8px 30px',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: active ? 'rgba(203,166,247,0.16)' : 'transparent',
                      color: active ? '#b4f2af' : '#c1c9bc',
                      borderRight: active ? '3px solid #b4f2af' : '3px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 800, color: file.endsWith('.liquid') ? '#b4f2af' : file.endsWith('.css') ? '#89b4fa' : '#f9e2af', fontFamily: 'monospace' }}>
                      {file.endsWith('.liquid') ? 'HTML' : file.endsWith('.css') ? 'CSS' : 'JS'}
                    </span>
                    <span style={{ fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {!isEditorRoute && <div style={{ flex: 1 }} />}

      {/* Bottom: user info */}
      <div style={{ padding: '16px 12px', borderTop: `1px solid ${C.border1}`, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* User avatar + dropdown trigger */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px',
              width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
              borderRadius: R.md, transition: 'background 0.15s',
            }}
          >
            {userImage ? (
              <img src={userImage} alt={userName} style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(197,255,191,0.2)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.bgElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: F.md, color: C.accentGreen, border: '2px solid rgba(197,255,191,0.2)', flexShrink: 0 }}>
                {userName[0]?.toUpperCase()}
              </div>
            )}
            <div style={{ overflow: 'hidden', flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: F.base, fontWeight: 600, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: F.xs, color: C.accentGreenDim }}>{planData.badge}</div>
            </div>
            <span style={{ fontSize: F.xs, color: C.textDisabled, marginRight: 2 }}>⌄</span>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0,
              background: C.bgSurface, border: `1px solid ${C.border3}`,
              borderRadius: R.lg, overflow: 'hidden', zIndex: 200,
              boxShadow: '0 -12px 32px rgba(0,0,0,0.4)',
            }}>
              <button
                onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '11px 14px', background: 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: F.md, color: C.textPrimary,
                  textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.bgElevated)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: F.xl }}>✦</span>
                AI Builder Settings
              </button>

              <div style={{ height: 1, background: C.border2 }} />

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '11px 14px', background: 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: F.md, color: C.error,
                  textAlign: 'left', transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = C.errorBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: F.xl }}>→</span>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {settingsOpen && <AISettingsModal onClose={() => setSettingsOpen(false)} />}
    </aside>
  );
}
