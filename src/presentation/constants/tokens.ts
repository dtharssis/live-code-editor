/**
 * Design Tokens — LiquidFlow
 * Single source of truth for all visual values.
 * Import and use these instead of raw strings in inline styles.
 */

// ── Colors ──────────────────────────────────────────────────────────────────

export const C = {
  // Backgrounds — layered from deepest to highest
  bgBase:       '#0d0d1c',   // deepest — sidebar, preview bg
  bgApp:        '#121221',   // app shell
  bgSurface:    '#1e1e2e',   // cards, panels
  bgElevated:   '#292839',   // inlays, active tabs
  bgActive:     '#333344',   // selected state, secondary buttons
  bgInput:      '#0d0d1c',   // form inputs

  // Text
  textPrimary:  '#e3e0f7',   // headings, body
  textSecondary:'#c1c9bc',   // secondary labels
  textMuted:    '#8b9387',   // hints, metadata
  textDisabled: '#41493f',   // disabled, separators

  // Accent — Green (primary brand)
  accentGreen:  '#c5ffbf',   // CTA highlights, dots, accents
  accentGreenMd:'#a6e3a1',   // gradient end, saved states
  accentGreenDim:'#99d595',  // tertiary actions
  onAccent:     '#00390c',   // text on green buttons

  // Accent — Purple (manual/secondary)
  accentPurple: '#c5c4dc',   // manual badge
  accentBlue:   '#89b4fa',   // CSS file badge

  // Semantic
  error:        '#ffb4ab',
  errorBg:      'rgba(255,180,171,0.08)',

  // Borders — all share the same hue, vary in opacity
  border1:      'rgba(65,73,63,0.08)',   // barely visible separators
  border2:      'rgba(65,73,63,0.12)',   // default card borders
  border3:      'rgba(65,73,63,0.2)',    // button borders, inputs
  border4:      'rgba(65,73,63,0.3)',    // modal borders, dashed areas

  // AI method badges
  aiBg:         'rgba(197,255,191,0.1)',
  manualBg:     'rgba(197,196,220,0.1)',
} as const;

// ── Border Radius ────────────────────────────────────────────────────────────

export const R = {
  sm:   6,   // badges, tiny pills
  md:   8,   // buttons, inputs, small elements
  lg:   12,  // toolbar items, tab groups
  xl:   16,  // cards, modals, panels
  full: 9999, // fully rounded (dots, avatars)
} as const;

// ── Spacing ──────────────────────────────────────────────────────────────────

export const S = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
} as const;

// ── Typography ───────────────────────────────────────────────────────────────

export const F = {
  display: "'Space Grotesk', system-ui, sans-serif",
  body:    "'Inter', system-ui, sans-serif",
  mono:    "monospace",

  // Sizes
  xs:   10,
  sm:   11,
  base: 12,
  md:   13,
  lg:   14,
  xl:   15,
  '2xl': 16,
  '3xl': 18,
  '4xl': 22,
  '5xl': 26,
  '6xl': 28,
} as const;

// ── Shadows ──────────────────────────────────────────────────────────────────

export const SHADOW = {
  modal:   '0 32px 80px rgba(0,0,0,0.6)',
  card:    '0 20px 60px rgba(0,0,0,0.5)',
  sm:      '0 8px 24px rgba(0,0,0,0.3)',
  accent:  '0 8px 24px rgba(166,227,161,0.3)',
} as const;

// ── Reusable Style Objects ───────────────────────────────────────────────────

/** Standard card */
export const card = {
  background:   C.bgSurface,
  border:       `1px solid ${C.border2}`,
  borderRadius: R.xl,
} as const;

/** Overlay backdrop */
export const backdrop = {
  position:       'fixed' as const,
  inset:          0,
  background:     'rgba(0,0,0,0.65)',
  backdropFilter: 'blur(4px)',
} as const;

/** Section label (ALL CAPS, muted) */
export const sectionLabel = {
  fontSize:      F.xs,
  fontWeight:    700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  color:         C.textDisabled,
} as const;

/** Page heading */
export const pageHeading = {
  fontFamily:    F.display,
  fontSize:      F['6xl'],
  fontWeight:    700,
  color:         C.textPrimary,
  letterSpacing: '-0.02em',
  margin:        0,
} as const;

/** Page sub-heading */
export const pageSubheading = {
  fontFamily:    F.display,
  fontSize:      F['3xl'],
  fontWeight:    700,
  color:         C.textPrimary,
  margin:        0,
} as const;

/** Description text under headings */
export const pageDescription = {
  fontSize:   F.md,
  color:      C.textMuted,
  lineHeight: 1.6,
  margin:     0,
} as const;

/** Primary button — green gradient */
export const btnPrimary = {
  display:      'inline-flex' as const,
  alignItems:   'center' as const,
  gap:          6,
  padding:      '8px 16px',
  borderRadius: R.md,
  border:       'none',
  background:   `linear-gradient(135deg,${C.accentGreen},${C.accentGreenMd})`,
  color:        C.onAccent,
  fontSize:     F.base,
  fontWeight:   700,
  cursor:       'pointer',
  whiteSpace:   'nowrap' as const,
} as const;

/** Secondary button — dark surface */
export const btnSecondary = {
  display:      'inline-flex' as const,
  alignItems:   'center' as const,
  gap:          6,
  padding:      '8px 16px',
  borderRadius: R.md,
  border:       `1px solid ${C.border3}`,
  background:   C.bgActive,
  color:        C.textPrimary,
  fontSize:     F.base,
  fontWeight:   600,
  cursor:       'pointer',
  whiteSpace:   'nowrap' as const,
} as const;

/** Ghost button — transparent */
export const btnGhost = {
  display:      'inline-flex' as const,
  alignItems:   'center' as const,
  gap:          6,
  padding:      '8px 16px',
  borderRadius: R.md,
  border:       `1px solid ${C.border3}`,
  background:   'transparent',
  color:        C.textMuted,
  fontSize:     F.base,
  fontWeight:   500,
  cursor:       'pointer',
  whiteSpace:   'nowrap' as const,
} as const;

/** Form input */
export const input = {
  width:        '100%',
  padding:      '9px 12px',
  background:   C.bgInput,
  border:       `1px solid ${C.border3}`,
  borderRadius: R.md,
  color:        C.textPrimary,
  fontSize:     F.md,
  outline:      'none',
  boxSizing:    'border-box' as const,
} as const;

/** Method badge — AI */
export const badgeAI = {
  fontSize:      F.xs,
  fontWeight:    700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  padding:       '2px 8px',
  borderRadius:  R.sm,
  background:    C.aiBg,
  color:         C.accentGreen,
} as const;

/** Method badge — Manual */
export const badgeManual = {
  fontSize:      F.xs,
  fontWeight:    700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  padding:       '2px 8px',
  borderRadius:  R.sm,
  background:    C.manualBg,
  color:         C.accentPurple,
} as const;
