# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

There is no build step. Open `reference/HR Portal.html` directly in a browser — React 18, ReactDOM, and Babel are loaded from CDN (unpkg.com). Babel transpiles JSX inline at runtime.

To serve locally (avoids CORS issues with some browsers):
```
npx serve reference
# or
python -m http.server --directory reference
```

There are no tests, no lint scripts, and no package manager config.

## Architecture

**Single-page React app** (no router library) where `reference/hr-app.jsx` owns all navigation state. All files use `<script type="text/babel">` tags declared in `HR Portal.html`; Babel compiles everything into the same global scope, so components are shared via `window.*` assignments at the bottom of each file.

**Load order** (from `HR Portal.html`): `icons.jsx` → `icons-hr.jsx` → `hr-data.jsx` → `tweaks-panel.jsx` → `toast.jsx` → `hr-shell.jsx` → screens → `hr-app.jsx`. Each file assumes the previous ones have already run.

### File roles

| File | Role |
|---|---|
| `hr-app.jsx` | Root component `HrApp`: `route` state, accent theming, call overlay, breadcrumb map, screen dispatch |
| `hr-data.jsx` | All mock data exported as `HR_DATA` global: employees, feed, schedule, KPIs, messages, groups, etc. |
| `hr-shell.jsx` | `HrSidebar`, `HrTopbar`, `Avatar`, `Sparkline` — shared layout chrome, exported to `window.*` |
| `toast.jsx` | `ToastHost` (global `window.toast(msg, {kind, sub, dwell})` API), `Popover`, `MenuPopover`, `NotificationsPopover`, `UserMenuPopover` |
| `icons.jsx` | `I.*` icon library — generic icons (Home, Search, Check, etc.) |
| `icons-hr.jsx` | `Ihr.*` icon library — HR-specific icons (Dashboard, Team, Chart, etc.) |
| `tweaks-panel.jsx` | Dev settings overlay: `useTweaks(defaults)` hook (persists to localStorage) + `TweaksPanel`/`TweakSection`/`TweakColor`/`TweakSelect`/`TweakButton` controls |
| `styles.css` | Base design system — CSS custom properties, layout primitives |
| `hr-styles.css` | HR portal styles — `.page`, `.btn`, `.topbar`, `.sidebar`, data tables, chat, calendar, etc. |
| `screens/dashboard.jsx` | Dashboard: KPI tiles, activity feed, today's schedule |
| `screens/employees.jsx` | Employee roster + `Profile` sub-screen |
| `screens/performance.jsx` | Performance view: heatmap, cohort rankings, risk list |
| `screens/messages.jsx` | Direct messages with threaded conversation |
| `screens/groups.jsx` | Group chats |
| `screens/call-overlay.jsx` | Video/voice call overlay (`CallOverlay`) |
| `screens/extra.jsx` | Calendar, Requests, Rewards, Settings screens |

### Navigation model

`hr-app.jsx` maintains a `route` string. `setRoute(r)` switches the active screen. The `profile` sub-screen also requires `profileId` state. Fullbleed mode (no padding) is activated for `messages` and `groups`. Routes: `dashboard`, `employees`, `profile`, `performance`, `messages`, `groups`, `calendar`, `requests`, `rewards`, `settings`.

### Global APIs

- **`window.toast(msg, opts)`** — show a toast. `opts.kind`: `"good"` | `"bad"` | `"warn"` | `"info"`. `opts.sub`: subtitle string. `opts.dwell`: ms visible (default 2600).
- **`HR_DATA`** — global data object from `hr-data.jsx`. Contains `EMPLOYEES`, `DIRECT`, `GROUPS`, `FEED`, `SCHEDULE`, `PERF_KPIS`, `MODULES`, `HEATMAP`, `CALENDAR_EVENTS`, `HR_USER`, plus helper functions `avClassFromId(id)` and `initials(name)`.

### Hook aliasing pattern

Because all files share global scope, React hooks are aliased per-file to avoid collisions:
```js
const { useState: useState_sh, useRef: useRef_sh } = React;
```
Use a file-specific suffix (e.g., `_app`, `_sh`, `_t`, `_x`) when adding hooks to any file.

### Design system conventions

- Theme accent via CSS custom properties: `--cobalt`, `--cobalt-deep`, `--cobalt-ink`, `--cobalt-tint`, `--cobalt-tint-2`, `--cobalt-glow`. The accent palette (4 colors) is set in `hr-app.jsx`'s `useEffect`.
- Base tokens in `styles.css`: `--ink`, `--ink-2`, `--mute`, `--mute-2`, `--mute-3`, `--surface`, `--surface-2`, `--line`, `--line-2`, `--good`, `--warn`, `--bad`, `--font-sans`, `--font-mono`, `--r-sm`, `--r-lg`
- Avatar colors: `.av-1` through `.av-8`, assigned deterministically by `avClassFromId(id % 8)`.
- Button variants: `.btn` (default), `.btn.primary` (cobalt fill), `.btn.ghost` (borderless)
- Page structure: `.page` > `.page-head` (with `.left` / `.right`) + content sections
- Tweaks panel defaults are in a `DEFAULTS` const wrapped in `/*EDITMODE-BEGIN*/…/*EDITMODE-END*/` markers (used by the external edit-mode protocol).
