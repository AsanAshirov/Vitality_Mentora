# Vitality Mentora

A full-featured **banking simulator and training platform** built for onboarding bank tellers and compliance officers. Trainees practice real banking procedures — KYC, AML, sanctions screening, account opening, deposits, transfers, and card issuance — in a safe synthetic environment with an AI assistant and voice agent. HR managers have a separate dashboard to monitor cohort progress and assign training tasks.

---

## Features

### Two Portals in One App

The app has two completely separate interfaces behind a role selector:

| Role | Entry | What it is |
|---|---|---|
| **Стажёр** (Intern) | `/` | Banking simulator, tasks, knowledge base, badges, profile |
| **HR менеджер** | `/hr` | Trainee monitoring, cohort analytics, assignments, activity feed |

On first visit, users land on `/portal` to choose their role. The choice is saved in `localStorage` and remembered on refresh. A **"⇄ Сменить портал"** button in both interfaces lets users switch roles at any time.

---

### Intern Portal

#### 5 Interactive Banking Scenarios

Each scenario is a multi-step form with a step rail, real scoring, XP rewards, and mentor feedback on completion.

| Scenario | Steps | Key Skills |
|---|---|---|
| **KYC Verification** | 6 steps | Customer lookup → identity check → sanctions screening → source of funds → risk rating → submit |
| **Account Opening** | 4 steps | Customer selection → product/currency choice → tariff confirmation → documents & OTP |
| **Deposits** | 4 steps | Client & amount → term & rate → source of funds (≥50M UZS) → confirmation |
| **Transfers** | 5 steps | Sender account → recipient (Internal/IBAN/SWIFT) → amount → AML check → confirmation |
| **Card Issuance** | 4 steps | Customer → card brand/type (UZCARD/HUMO/VISA/Mastercard) → limits & delivery → review |

Scenarios unlock progressively: KYC → Accounts → Deposits → Transfers → Cards. Each requires a passing score (≥60%) to unlock the next.

#### Scoring Engine
- Each step contributes weighted points (15–25 pts)
- Sanctions step: correct escalation = 25 pts, ignoring = −20 pts
- AML step: correct escalation = +20 pts, proceeding without check = −15 pts
- Time efficiency bonus/penalty
- Hint penalty: −2 pts per hint used
- Grades: **A** (≥90) · **B** (≥75) · **C** (≥60) · **ПЕРЕСДАТЬ** (<60)

#### Compliance Reference Pages (inside Simulator)
- **Sanctions List** — OFAC/EU/UN/CBU entries with risk levels and hit detection
- **PEP Register** — politically exposed persons database
- **AML Reports** — STR/CTR report list with "Новый STR" form
- **Procedures Handbook** — 10 indexed banking procedures (KYC-PROC, AML-HB, SWIFT limits, etc.)
- **Activity Log** — timestamped audit trail of all trainee actions

#### Gamification
- **XP & Levels** — earn XP on every scenario completion, level up threshold increases per level
- **Streak** — daily login streak tracked and displayed (auto-resets if missed a day)
- **Badges** — 12 achievement badges: first KYC, compliance pro, perfectionist, no-hints runs, streak milestones, etc.
- **Skills radar** — per-skill proficiency bars updated after each scenario

#### Dashboard
- Today's mission card with scenario launch shortcut
- Weekly brief modal (opens on "Открыть бриф")
- Live XP bar, streak dots, recent badge unlocks
- Locked/unlocked scenario tiles

#### Tasks Page
- Structured task list grouped by status (todo / in progress / done)
- Direct "Начать" link to the relevant scenario

#### Messages
- Multi-chat interface with team contacts (mentor Tatiana, compliance lead, manager)
- Auto-reply bot ("Спросить наставника") with canned banking Q&A

#### Knowledge Base
- 9 full-text articles covering KYC procedures, AML rules, sanctions, PEP handling, SWIFT limits, FX rates, card issuance, escalation protocols, deposit SOF requirements

#### Badges Page
- Visual grid of all 12 badges with unlock status, progress bars for in-progress badges, and unlock dates

#### Profile & Settings
- **Language** — Russian / Uzbek / English (UI switches instantly, persisted)
- **Density** — Compact / Regular / Comfy layout
- **Accent color** — customizable cobalt hex
- **Clicky** — enable/disable, smart/ghost mode, color, name, voice persona
- **Tutorial mode** — auto-summon Clicky on simulator entry
- **Silent mode** — disables TTS
- All settings persist to `localStorage`

---

### Clicky — Voice AI Companion

Clicky is a cursor-following AI companion that activates on **backtick (`) hold**:

1. **Hold `` ` ``** — STT starts listening (microphone icon pulses)
2. **Speak** — e.g. *"что делать на шаге санкций?"*
3. **Release** — voice agent fires:
   - **Keyword extractor** maps spoken words to a UI element (e.g. `sanctions-card`) → element glows blue **immediately**
   - **AI streams** a 2–3 sentence natural-language answer (Gemini → Groq fallback)
   - **TTS speaks** sentence-by-sentence in real time as the AI generates
   - **Clicky bubble** shows streaming text with a cursor indicator `▍`
   - **Auto-dismisses** 6 seconds after done, or click **"Понятно"**
   - **Escape** cancels mid-speech

Supported keywords cover all scenario steps, compliance pages, and nav items in Russian, Uzbek, and English. If no keyword matches, the bubble floats near your cursor.

In **ghost mode**, Clicky follows the cursor without highlighting elements. In **smart mode** (default), it highlights the relevant UI element and anchors the bubble to it.

---

### Mentora AI — Chat Assistant

A floating glassmorphism chat panel (bottom-right `✦` button):

- **Gemini → Groq → canned answers** fallback chain — always responds even if API quota is exhausted
- **FAQ chips** — 8 quick-tap question shortcuts per language
- **Voice input** — mic button inside the panel for hands-free typing
- **TTS toggle** 🔊 — bot reads answers aloud
- **Document upload** — attach `.txt`/`.csv` files for context-aware answers
- **Anti-hallucination** — strict system prompt limiting answers to the banking knowledge base
- **Citation tags** — responses cite the relevant procedure codes (KYC-PROC, AML-HB, etc.)
- Separate from the Clicky voice agent — both can be used independently

---

### HR Portal

A standalone dashboard for HR managers to monitor trainee cohorts:

- **Stat cards** — total trainees, active, at-risk, average score, average streak
- **Cohort filter** — filter by Q1/Q2/Q3-2026 or view all
- **Sort** — by XP, score, or streak
- **Trainee table** — per-trainee XP bar, scenario progress, average score, status pill (Active / Inactive / At-risk)
- **Assignments panel** — progress bars per assignment with due dates and completion rates
- **Activity feed** — color-coded real-time trainee activity log
- **HR Screens**: Dashboard, Employees, Groups, Messages, Performance, Call Overlay
- **"⇄ Сменить портал"** — switch back to intern view

---

### Synthetic Data

All data is fully synthetic — no real customer information:

- **21 customers** — 16 individuals + 5 corporates, including edge cases: frozen accounts, PEP-family relatives, non-residents, high-risk SWIFT targets
- **Accounts, Deposits, Transfers, Cards** — realistic UZS/USD/EUR balances and transaction history including AML flags (structuring patterns, large cross-border transfers)
- **Sanctions entries** — OFAC/EU/UN/CBU lists with hit detection
- **PEP register** — politically exposed persons with status tracking
- **AML reports** — STR and CTR reports
- **Handbook** — 10 procedure documents
- **Loans** — 8 loan records

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 8 |
| UI | React 19 + TypeScript strict |
| Routing | React Router v7 |
| State | Zustand 5 + persist middleware |
| AI (primary) | Google Gemini 2.0 Flash via `@google/generative-ai` |
| AI (fallback) | Groq Llama 3.3 70B / 3.1 8B via `groq-sdk` |
| STT | Web Speech API (`webkitSpeechRecognition`) |
| TTS | Web Speech API (async voice loading, best-voice selection) |
| Styling | Single `index.css` — CSS custom properties design system |
| Persistence | `localStorage` via Zustand persist |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A modern browser (Chrome/Edge recommended for STT/TTS support)

### 1. Clone the repository

```bash
git clone https://github.com/AsanAshirov/Vitality_Mentora.git
cd Vitality_Mentora
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up API keys

Create a `.env.local` file in the project root (never committed):

```env
VITE_GEMINI_KEY=your_gemini_api_key_here
VITE_GROQ_KEY=your_groq_api_key_here
```

- **Gemini key** — get from [Google AI Studio](https://aistudio.google.com/app/apikey) (free tier)
- **Groq key** — get from [console.groq.com](https://console.groq.com) (free tier)

> The app works without API keys — it falls back to canned banking Q&A answers. STT/TTS require no keys (browser built-in).

### 4. Run the dev server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 5. Build for production

```bash
npm run build
```

Output is in `dist/`. Preview with:

```bash
npm run preview
```

---

## Project Structure

```
src/
├── App.tsx                      # Root — CSS vars, PTT handler, keyboard shortcuts
├── router.tsx                   # React Router config, ProtectedScenario guard
├── main.tsx                     # Vite entry
├── index.css                    # Full design system (CSS custom properties)
│
├── data/
│   └── synth.ts                 # All synthetic data (customers, accounts, etc.)
│
├── store/
│   ├── userStore.ts             # XP, level, streak, badges, skills, completed runs
│   ├── settingsStore.ts         # Lang, density, accent, Clicky config — persisted
│   ├── scenarioStore.ts         # Active scenario state (not persisted)
│   ├── messagesStore.ts         # Chat messages (persisted)
│   └── clickyStore.ts           # Voice agent transient state (not persisted)
│
├── lib/
│   ├── gemini.ts                # Gemini streaming client + Groq fallback + canned answers
│   ├── groq.ts                  # Groq streaming client
│   ├── tts.ts                   # Web Speech API TTS with async voice loading
│   ├── stt.ts                   # Web Speech API STT with language fallback chain
│   ├── voiceAgent.ts            # PTT → AI → TTS + highlight orchestrator
│   ├── keywordMap.ts            # Spoken keyword → data-clicky-target map (RU/UZ/EN)
│   ├── scoring.ts               # Score calculation for all 5 scenarios
│   ├── badges.ts                # Badge unlock conditions and triggers
│   ├── progression.ts           # Scenario unlock rules, XP→level thresholds
│   └── i18n.ts                  # UI strings for RU/UZ/EN
│
├── components/
│   ├── Shell.tsx                # Sidebar + topbar app frame
│   ├── SimShell.tsx             # Simulator chrome (step rail, side panel)
│   ├── Clicky.tsx               # Cursor companion + voice agent bubble
│   ├── AiAssistant.tsx          # Floating AI chat panel (Mentora AI)
│   ├── Chat.tsx                 # RAG knowledge base chatbot
│   ├── SidePanel.tsx            # Collapsible right panel
│   ├── Icons.tsx                # Icon library
│   ├── Resizable.tsx            # Drag-to-resize sidebar
│   └── modals/
│       ├── WeekBriefModal.tsx   # Weekly assignment brief
│       └── SearchModal.tsx      # Cmd+K global search
│
├── screens/
│   ├── Dashboard.tsx
│   ├── Tasks.tsx
│   ├── Messages.tsx
│   ├── Results.tsx              # Post-scenario score + feedback
│   ├── simulator/
│   │   ├── Simulator.tsx        # KYC 6-step scenario
│   │   ├── Scenarios.tsx        # Account / Deposit / Transfer / Card scenarios
│   │   └── SimPages.tsx         # Sanctions / PEP / AML / Handbook / Activity pages
│   └── personal/
│       └── PersonalScreens.tsx  # Knowledge, Badges, Profile, Settings
│
└── hr/                          # HR Portal (standalone, no Shell)
    ├── HrApp.tsx
    ├── hrData.ts
    ├── hrTypes.ts
    ├── hr.css
    ├── screens/
    │   ├── HrDashboard.tsx
    │   ├── HrEmployees.tsx
    │   ├── HrGroups.tsx
    │   ├── HrMessages.tsx
    │   ├── HrPerformance.tsx
    │   └── HrCallOverlay.tsx
    └── shell/
        ├── HrSidebar.tsx
        ├── HrTopbar.tsx
        ├── Avatar.tsx
        └── Sparkline.tsx
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `` ` `` (hold) | Activate Clicky voice agent (PTT) |
| `Ctrl+K` / `⌘K` | Open global search |
| `Escape` | Close modals / cancel voice agent |

---

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| STT (voice input) | ✅ | ✅ | ❌ | ⚠️ partial |
| TTS (voice output) | ✅ | ✅ | ✅ | ✅ |
| Full UI | ✅ | ✅ | ✅ | ✅ |

STT requires microphone permission. Chrome/Edge give the best voice recognition quality.

---

## License

MIT
