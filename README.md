# Live Editor

> Real-time HTML & Shopify Liquid code editor — built with Next.js 14, TypeScript, Tailwind CSS and Hexagonal Architecture.

Created by [@dtharssis](https://github.com/dtharssis)

---

## Features

- **Dual mode** — HTML/CSS/JS editor and Shopify Liquid section editor
- **Real-time preview** with auto-run and manual run
- **Liquid variable manager** — text and media (image upload) variables
- **Static analysis** — inline error/warning detection for HTML, CSS, JS and Liquid
- **Export** — download as a static HTML zip or a Shopify section zip
- **Theme** — Auto / Dark / Light
- **Resizable panels** — drag vertical and horizontal dividers
- **Mobile-friendly** — tabbed layout on small screens

---

## Architecture

Hexagonal architecture (Ports & Adapters):

```
src/
├── domain/                   # Pure business types — no framework deps
│   ├── entities/             #   Project, Variable, ConsoleEntry
│   ├── ports/                #   Input/output interfaces (IZipPort, IExportPort)
│   └── value-objects/        #   EditorMode, ThemeMode, etc.
│
├── application/              # Use cases & services — depend only on domain
│   ├── services/             #   LiquidRendererService, CodeAnalyzerService
│   └── use-cases/            #   ExportHtmlUseCase, ExportShopifyUseCase
│
├── infrastructure/           # Concrete adapters (framework-aware)
│   └── adapters/             #   ZipJSZipAdapter (JSZip implementation)
│
├── presentation/             # React / Next.js layer
│   ├── store/                #   Zustand global state
│   ├── hooks/                #   useTheme, usePreview, useResize
│   └── components/           #   AppHeader, EditorPanel, PreviewPanel, Modals…
│
└── app/                      # Next.js App Router entry points
    ├── layout.tsx
    ├── page.tsx
    └── globals.css
```

---

## Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Framework      | Next.js 14 (App Router)        |
| Language       | TypeScript 5                   |
| Styling        | Tailwind CSS 3                 |
| Editor         | CodeMirror 6                   |
| State          | Zustand 4                      |
| Zip export     | JSZip 3                        |
| Deploy target  | Vercel (static export)         |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Build

```bash
npm run build
# Static output in /out
```

---

## Docker

### Development (hot-reload)

```bash
docker compose --profile dev up
# → http://localhost:3000
```

### Production (nginx serving the static build)

```bash
docker compose --profile prod up --build
# → http://localhost:8080
```

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The project uses `output: 'export'` — no serverless functions required. Works equally on **Vercel**, **Cloudflare Pages**, **Netlify**, or any static host.

---

## License

MIT © 2025 dtharssis
