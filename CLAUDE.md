# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

There is no build step. Open `reference/index.html` directly in a browser — React 18, ReactDOM, and Babel are loaded from CDN (unpkg.com). Babel transpiles JSX inline at runtime.

To serve locally (avoids CORS issues with some browsers):
```
npx serve reference
# or
python -m http.server --directory reference
```

There are no tests, no lint scripts, and no package manager config.

## Architecture

**Single-page React app** (no router library) where `reference/app.jsx` owns all navigation state and passes the current `page` string down to `<Shell>` → screens. All files use `<script type="text/babel">` tags loaded from `index.html`.

### File roles

| File | Role |
|---|---|
| `app.jsx` | Root component: page routing, gamification state (XP/level/streak), chat panel, Clicky companion, theming, keyboard shortcuts |
| `styles.css` | Full design system — CSS custom properties, layout, all component classes |
| `components/Shell.jsx` | App chrome: sidebar nav, topbar, workspace container; also exports the `I.*` icon library |
| `components/SimShell.jsx` | Simulator-specific chrome: step rail, side panel, header band, footer |
| `components/Chat.jsx` | RAG-style knowledge base chatbot with canned Q&A in RU/UZ/EN |
| `components/Clicky.jsx` | Cursor-following AI companion; anchors hint bubbles to elements via `data-hint` attributes |
| `screens/Simulator.jsx` | KYC verification scenario (6 steps): lookup → identity → sanctions → funds → risk → submit |
| `screens/SimPages.jsx` | Simulator sub-pages: sanctions list, PEP database, AML handbook, activity log |
| `screens/Scenarios.jsx` | Four additional scenarios: account opening, deposits, transfers, card issuance |
| `screens/Results.jsx` | Post-scenario feedback: score, XP earned, action breakdown |
| `data/synth.jsx` | All synthetic customer/account/deposit/transfer/card data (no real data) |
| `tweaks-panel.jsx` | Dev settings overlay (`useTweaks` hook persists state) |

### Navigation model

`app.jsx` maintains a `page` string and a `scenario` string. Navigating between top-level sections sets `page`; launching a scenario sets both `page = "simulator"` and `scenario = "<type>"`. The Results screen receives a `results` object prop and a callback to return home.

### Simulator flow

Each scenario is a multi-step form with a shared step-rail UI (`SimShell`). Steps are defined as arrays of objects inside each scenario component. User actions are recorded and scored; the final step triggers `onComplete(results)` which navigates to Results.

### Hint system

`Clicky` reads `data-hint="<key>"` attributes on DOM elements. When a step activates, `app.jsx` calls `clicky.setStep(key)` which moves the companion to that element and shows a hint bubble. Hint strings are keyed by step and locale.

### Multilingual strings

Language is stored in app-level state (`lang`: `"ru"` | `"uz"` | `"en"`). Components receive `lang` as a prop and index into local string maps. Russian is the primary/complete locale; Uzbek and English may be partial.

### Design system conventions

- Colors via CSS custom properties: `--blue`, `--blue-tint`, `--ink-*`, `--surface-*`, `--good`, `--warn`, `--bad`, `--orange` (synthetic data marker)
- Spacing via `--gap-*` and `--radius-*` tokens
- Density classes on `<body>`: `density-compact` | `density-regular` | `density-comfy`
- Button variants: `.btn` (primary), `.btn.ghost`, `.btn.light-on-cobalt`
- CRM-style form cards: `.crm-card` with `.crm-row` / `.crm-label` / `.crm-val`
- Data tables: `.data-table` > `.dt-head` / `.dt-row` / `.dt-c`
- Simulator layout: `.sim-band`, `.sim-body`, `.sim-side`, `.sim-rail`, `.sim-main`, `.sim-foot`
