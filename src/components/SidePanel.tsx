// SidePanel.tsx — right-edge panel housing Clicky settings + Chat.
// Two states: collapsed (56px rail with icons) and expanded (340px full panel).
import React from 'react'
import { I } from './Icons'
import { Resizable } from './Resizable'
import { ChatWidget } from './Chat'
import { useSettingsStore } from '../store/settingsStore'
import { useUserStore } from '../store/userStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidePanelProps {
  summoned: boolean
  setSummoned: (v: boolean) => void
  chatProps?: object
}

// ─── Color / voice / lang constants ──────────────────────────────────────────

const CLICKY_COLORS = [
  { v: '#2046FF', name: 'Кобальт' },
  { v: '#0F2BD9', name: 'Глубокий' },
  { v: '#FF7A1A', name: 'Янтарь' },
  { v: '#0B8F5C', name: 'Хвоя' },
  { v: '#6F47E0', name: 'Лаванда' },
  { v: '#D7406A', name: 'Малина' },
]

const CLICKY_LANGS = [
  { v: 'RU', label: 'Русский' },
  { v: 'UZ', label: 'Oʻzbekcha' },
  { v: 'EN', label: 'English' },
]

const CLICKY_VOICES = [
  { v: 'guide',   label: 'Проводник',    desc: 'Спокойный, объясняющий' },
  { v: 'coach',   label: 'Тренер',       desc: 'Прямой, мотивирующий' },
  { v: 'neutral', label: 'Нейтральный',  desc: 'Краткий, без эмоций' },
]

// ─── SidePanel ────────────────────────────────────────────────────────────────

export default function SidePanel({ summoned, setSummoned, chatProps }: SidePanelProps) {
  const {
    panelOpen, setPanelOpen,
    panelTab, setPanelTab,
    clickyColor, clickyName, clickyVoice, clickyLang,
    tutorialMode, autoHint, silentMode, soundEnabled,
    setClicky,
  } = useSettingsStore()

  const clicky = {
    color: clickyColor,
    name: clickyName,
    voice: clickyVoice,
    lang: clickyLang,
    tutorial: tutorialMode,
    autoHint,
    silent: silentMode,
    sound: soundEnabled,
  }

  const setClickyField = (patch: Partial<typeof clicky>) => {
    const map: Record<string, string> = {
      color: 'clickyColor',
      name: 'clickyName',
      voice: 'clickyVoice',
      lang: 'clickyLang',
      tutorial: 'tutorialMode',
      autoHint: 'autoHint',
      silent: 'silentMode',
      sound: 'soundEnabled',
    }
    const storePatch: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(patch)) {
      storePatch[map[k] ?? k] = v
    }
    setClicky(storePatch as Parameters<typeof setClicky>[0])
  }

  return (
    <aside className={`side-panel ${panelOpen ? 'expanded' : 'collapsed'}`}>
      <div className="sp-rail">
        <button
          className={`sp-rail-btn ${panelTab === 'clicky' ? 'active' : ''}`}
          onClick={() => {
            if (panelOpen && panelTab === 'clicky') setPanelOpen(false)
            else { setPanelTab('clicky'); setPanelOpen(true) }
          }}
          title="Клик"
        >
          <I.Spark size={16} />
        </button>
        <button
          className={`sp-rail-btn ${panelTab === 'chat' ? 'active' : ''}`}
          onClick={() => {
            if (panelOpen && panelTab === 'chat') setPanelOpen(false)
            else { setPanelTab('chat'); setPanelOpen(true) }
          }}
          title="Чат · база знаний"
        >
          <I.Chat size={16} />
        </button>

        <div className="sp-rail-spacer" />

        {/* Clicky's resting slot — always visible in rail */}
        <div className="sp-rail-clicky-home">
          <div className="clicky-rest-label">Клик</div>
          <div id="clicky-rest" className="clicky-rest-slot">
            {/* The actual Clicky cursor positions itself over this slot when at rest */}
          </div>
          <button
            className={`summon-btn ${summoned ? 'active' : ''}`}
            onMouseDown={e => { e.preventDefault(); setSummoned(true) }}
            onMouseUp={() => setSummoned(false)}
            onMouseLeave={() => setSummoned(false)}
          >
            {summoned ? 'следую…' : 'призвать'}
          </button>
          <div className="summon-hint">
            или зажми <kbd>`</kbd>
          </div>
        </div>
      </div>

      {panelOpen && (
        <div className="sp-body">
          <Resizable side="left" cssVar="--sidepanel-w" min={260} max={520} defaultSize={320} />
          {panelTab === 'clicky' && (
            <ClickyTab clicky={clicky} setClicky={setClickyField} />
          )}
          {panelTab === 'chat' && (
            <ChatTab {...(chatProps ?? {})} />
          )}
        </div>
      )}
    </aside>
  )
}

// ─── ClickyTab ────────────────────────────────────────────────────────────────

interface ClickySettings {
  color: string
  name: string
  voice: string
  lang: string
  tutorial: boolean
  autoHint: boolean
  silent: boolean
  sound: boolean
}

function ClickyTab({
  clicky,
  setClicky,
}: {
  clicky: ClickySettings
  setClicky: (patch: Partial<ClickySettings>) => void
}) {
  const runs = useUserStore(s => s.completedRuns)
  const voiceInputMetric = runs.length * 2

  return (
    <div className="sp-tab">
      <div className="sp-tab-head">
        <h3>Клик</h3>
        <span className="tag cobalt">AI-проводник</span>
      </div>
      <p className="sub" style={{ marginTop: 4 }}>
        Маленький курсор-помощник. Живёт в этой панели, отвечает на голос, подсвечивает следующий шаг.
      </p>

      <div className="clicky-preview-card">
        <div className="cpc-glyph" style={{ '--clicky-color': clicky.color } as React.CSSProperties}>
          <div className="clicky-burst-mini">
            <i /><i /><i /><i />
          </div>
        </div>
        <div className="cpc-meta">
          <input
            className="cpc-name"
            value={clicky.name}
            onChange={e => setClicky({ ...clicky, name: e.target.value })}
          />
          <small>
            «{CLICKY_VOICES.find(v => v.v === clicky.voice)?.label}» · {clicky.lang}
          </small>
        </div>
      </div>

      <SettingBlock label="Цвет">
        <div className="color-swatches">
          {CLICKY_COLORS.map(c => (
            <button
              key={c.v}
              className={`swatch ${clicky.color === c.v ? 'active' : ''}`}
              style={{ background: c.v }}
              title={c.name}
              onClick={() => setClicky({ ...clicky, color: c.v })}
            />
          ))}
        </div>
      </SettingBlock>

      <SettingBlock label="Голос">
        {CLICKY_VOICES.map(v => (
          <button
            key={v.v}
            className={`option-row ${clicky.voice === v.v ? 'active' : ''}`}
            onClick={() => setClicky({ ...clicky, voice: v.v })}
          >
            <span className="opt-radio">
              {clicky.voice === v.v && <span />}
            </span>
            <div>
              <b>{v.label}</b>
              <span>{v.desc}</span>
            </div>
          </button>
        ))}
      </SettingBlock>

      <SettingBlock label="Язык речи">
        <div className="lang-tabs">
          {CLICKY_LANGS.map(l => (
            <button
              key={l.v}
              className={clicky.lang === l.v ? 'active' : ''}
              onClick={() => setClicky({ ...clicky, lang: l.v })}
            >
              {l.v}<small>{l.label}</small>
            </button>
          ))}
        </div>
      </SettingBlock>

      <SettingBlock label="Обучение">
        <ToggleRow
          label="Режим туториала"
          sub="На экране симулятора Клик сам появляется и ведёт по шагам"
          v={clicky.tutorial}
          on={() => setClicky({ ...clicky, tutorial: !clicky.tutorial })}
        />
        <ToggleRow
          label="Автоподсветка шага"
          sub="Подсвечивать следующий шаг в журнале/справочнике"
          v={clicky.autoHint}
          on={() => setClicky({ ...clicky, autoHint: !clicky.autoHint })}
        />
        <ToggleRow
          label="Тихий режим"
          sub="Не открывать пузыри без запроса"
          v={clicky.silent}
          on={() => setClicky({ ...clicky, silent: !clicky.silent })}
        />
        <ToggleRow
          label="Звук уведомлений"
          sub="Лёгкий клик при появлении подсказок"
          v={clicky.sound}
          on={() => setClicky({ ...clicky, sound: !clicky.sound })}
        />
      </SettingBlock>

      <SettingBlock label="Активация">
        <div className="kbd-row">
          <kbd>`</kbd>
          <span>зажать · следовать за курсором</span>
        </div>
        <div className="kbd-row">
          <kbd>⌘</kbd><kbd>K</kbd>
          <span>открыть голосовое окно</span>
        </div>
      </SettingBlock>

      {voiceInputMetric > 0 && (
        <div className="sp-metric-row">
          <span className="sp-metric-label">Голосовых взаимодействий</span>
          <span className="sp-metric-val">{voiceInputMetric}</span>
        </div>
      )}

      <div className="sp-tab-foot">
        <small>Все диалоги обучают модель только для этой сессии. Запись не сохраняется.</small>
      </div>
    </div>
  )
}

// ─── ChatTab ──────────────────────────────────────────────────────────────────

function ChatTab(props: object) {
  const lang = useSettingsStore(s => s.lang)
  return (
    <div className="sp-tab sp-tab-chat">
      <ChatWidget
        open={true}
        onClose={() => {}}
        lang={lang}
        {...props}
      />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SettingBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="setting-block">
      <div className="setting-block-label">{label}</div>
      <div className="setting-block-body">{children}</div>
    </div>
  )
}

function ToggleRow({
  label,
  sub,
  v,
  on,
}: {
  label: string
  sub?: string
  v: boolean
  on: () => void
}) {
  return (
    <button className="tg-row" onClick={on}>
      <div>
        <b>{label}</b>
        {sub && <span>{sub}</span>}
      </div>
      <div className={`switch ${v ? 'on' : ''}`}>
        <i />
      </div>
    </button>
  )
}
