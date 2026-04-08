import { create } from 'zustand';
import { ThemeMode, MobileTab, ModalType, VariableType } from '../../domain/value-objects/types';
import { VariableStore } from '../../domain/entities/Variable';
import { ConsoleEntry } from '../../domain/entities/ConsoleEntry';
import { DEFAULT_FILES, DEFAULT_ACTIVE_FILE, DEFAULT_VARIABLES } from '../constants/defaultProjects';

// ─── Editor slice ────────────────────────────────────────────────────────────

interface EditorState {
  files:      Record<string, string>;
  activeFile: string;
  variables:  VariableStore;
  autoRun:    boolean;

  setActiveFile:     (file: string) => void;
  updateFileContent: (file: string, content: string) => void;
  resetFiles:        () => void;
  setVariable:        (key: string, value: string) => void;
  addVariable:        (key: string, type: VariableType) => void;
  deleteVariable:     (key: string) => void;
  toggleVariableType: (key: string) => void;
  setAutoRun:         (value: boolean) => void;
}

// ─── UI slice ────────────────────────────────────────────────────────────────

interface UIState {
  theme:          ThemeMode;
  consoleOpen:    boolean;
  activeModal:    ModalType | null;
  mobileTab:      MobileTab;
  consoleEntries: ConsoleEntry[];
  errorCount:     number;

  cycleTheme:      ()                => void;
  toggleConsole:   ()                => void;
  openModal:       (m: ModalType)    => void;
  closeModal:      ()                => void;
  setMobileTab:    (t: MobileTab)    => void;
  addConsoleEntry: (e: ConsoleEntry) => void;
  clearConsole:    ()                => void;
}

// ─── Combined store ──────────────────────────────────────────────────────────

type Store = EditorState & UIState;

const THEMES: ThemeMode[] = ['auto', 'dark', 'light'];

export const useStore = create<Store>((set, get) => ({
  // ── Editor ─────────────────────────────────────────────────────────────────
  files:      DEFAULT_FILES,
  activeFile: DEFAULT_ACTIVE_FILE,
  variables:  DEFAULT_VARIABLES,
  autoRun:    true,

  setActiveFile: (file) => set({ activeFile: file }),

  updateFileContent: (file, content) => {
    set(s => ({ files: { ...s.files, [file]: content } }));
  },

  resetFiles: () => set({
    files:      { 'dynamic-hero.liquid': '', 'theme.css': '', 'theme.js': '' },
    activeFile: 'dynamic-hero.liquid',
  }),

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
  activeModal:    null,
  mobileTab:      'editor',
  consoleEntries: [],
  errorCount:     0,

  cycleTheme: () => {
    const { theme } = get();
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    set({ theme: next });
  },

  toggleConsole: () => set(s => ({ consoleOpen: !s.consoleOpen })),

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
