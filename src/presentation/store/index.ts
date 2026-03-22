import { create } from 'zustand';
import { EditorMode, ThemeMode, PaneId, MobileTab, ModalType } from '../../domain/value-objects/types';
import { ProjectMap } from '../../domain/entities/Project';
import { VariableStore } from '../../domain/entities/Variable';
import { ConsoleEntry } from '../../domain/entities/ConsoleEntry';
import { DEFAULT_PROJECTS, DEFAULT_VARIABLES } from '../constants/defaultProjects';

// ─── Editor slice ────────────────────────────────────────────────────────────

interface EditorState {
  mode:      EditorMode;
  projects:  ProjectMap;
  variables: VariableStore;
  autoRun:   boolean;

  setMode:         (mode: EditorMode)          => void;
  updateCode:      (pane: PaneId, value: string) => void;
  setVariable:     (key: string, value: string)  => void;
  addVariable:     (key: string, type: import('../../domain/value-objects/types').VariableType) => void;
  deleteVariable:  (key: string)               => void;
  toggleVariableType: (key: string)            => void;
  setAutoRun:      (value: boolean)            => void;
}

// ─── UI slice ────────────────────────────────────────────────────────────────

interface UIState {
  theme:        ThemeMode;
  consoleOpen:  boolean;
  expandedPane: PaneId | null;
  activeModal:  ModalType | null;
  mobileTab:    MobileTab;
  consoleEntries: ConsoleEntry[];
  errorCount:   number;

  cycleTheme:        ()               => void;
  toggleConsole:     ()               => void;
  setExpandedPane:   (p: PaneId | null) => void;
  openModal:         (m: ModalType)   => void;
  closeModal:        ()               => void;
  setMobileTab:      (t: MobileTab)   => void;
  addConsoleEntry:   (e: ConsoleEntry) => void;
  clearConsole:      ()               => void;
}

// ─── Combined store ──────────────────────────────────────────────────────────

type Store = EditorState & UIState;

const THEMES: ThemeMode[] = ['auto', 'dark', 'light'];

export const useStore = create<Store>((set, get) => ({
  // ── Editor ─────────────────────────────────────────────────────────────────
  mode:      'html',
  projects:  DEFAULT_PROJECTS,
  variables: DEFAULT_VARIABLES,
  autoRun:   true,

  setMode: (mode) => {
    set({ mode });
  },

  updateCode: (pane, value) => {
    const { mode, projects } = get();
    set({
      projects: {
        ...projects,
        [mode]: { ...projects[mode], [pane]: value },
      },
    });
  },

  setVariable: (key, value) => {
    set(s => ({
      variables: {
        ...s.variables,
        values: { ...s.variables.values, [key]: value },
      },
    }));
  },

  addVariable: (key, type) => {
    set(s => ({
      variables: {
        values: { ...s.variables.values, [key]: '' },
        meta:   { ...s.variables.meta, [key]: type },
      },
    }));
  },

  deleteVariable: (key) => {
    set(s => {
      const values = { ...s.variables.values };
      const meta   = { ...s.variables.meta };
      delete values[key];
      delete meta[key];
      return { variables: { values, meta } };
    });
  },

  toggleVariableType: (key) => {
    set(s => {
      const current = s.variables.meta[key] ?? 'text';
      return {
        variables: {
          values: { ...s.variables.values, [key]: '' },
          meta:   { ...s.variables.meta, [key]: current === 'text' ? 'media' : 'text' },
        },
      };
    });
  },

  setAutoRun: (value) => set({ autoRun: value }),

  // ── UI ─────────────────────────────────────────────────────────────────────
  theme:          'auto',
  consoleOpen:    false,
  expandedPane:   null,
  activeModal:    null,
  mobileTab:      'markup',
  consoleEntries: [],
  errorCount:     0,

  cycleTheme: () => {
    const { theme } = get();
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    set({ theme: next });
  },

  toggleConsole: () => set(s => ({ consoleOpen: !s.consoleOpen })),

  setExpandedPane: (p) => set({ expandedPane: p }),

  openModal:  (m) => set({ activeModal: m }),
  closeModal: ()  => set({ activeModal: null }),

  setMobileTab: (t) => set({ mobileTab: t }),

  addConsoleEntry: (e) => {
    set(s => {
      const isError = e.level === 'err' || e.level === 'warn';
      const newCount = isError ? s.errorCount + 1 : s.errorCount;
      const shouldOpen = isError && !s.consoleOpen;
      return {
        consoleEntries: [...s.consoleEntries, e],
        errorCount:     newCount,
        consoleOpen:    shouldOpen ? true : s.consoleOpen,
      };
    });
  },

  clearConsole: () => set({ consoleEntries: [], errorCount: 0 }),
}));
