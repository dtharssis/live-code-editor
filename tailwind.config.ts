import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:       'var(--bg)',
        bg2:      'var(--bg2)',
        surface:  'var(--surface)',
        surface2: 'var(--surface2)',
        border:   'var(--border)',
        text:     'var(--text)',
        text2:    'var(--text2)',
        accent:   'var(--accent)',
        green:    'var(--green)',
        'tag-h':  'var(--tag-h)',
        'tag-c':  'var(--tag-c)',
        'tag-j':  'var(--tag-j)',
        'tag-l':  'var(--tag-l)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
