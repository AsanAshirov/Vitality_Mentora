// Dashboard.tsx — intern home screen (RU)
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useScenarioStore } from '../store/scenarioStore'
import { useMessagesStore } from '../store/messagesStore'
import { levelProgress, xpToNextLevel, LEVEL_NAMES } from '../lib/progression'
import { BADGE_DEFS } from '../lib/badges'
import { I } from '../components/Icons'
import type { ScenarioId } from '../store/userStore'

// Map from scenario display id → ScenarioId in the store
const SCENARIO_ID_MAP: Record<string, ScenarioId> = {
  kyc:      'kyc',
  open:     'accounts',
  deposit:  'deposits',
  transfer: 'transfers',
}

// Prerequisite labels for locked scenarios
const PREREQUISITES: Record<string, string> = {
  open:     'KYC (счёт 60+)',
  deposit:  'Открытие счёта (60+)',
  transfer: 'Депозиты (60+)',
}

interface ScenarioDef {
  id: string
  name: string
  desc: string
  glyph: React.ReactNode
}

const SCENARIO_DEFS: ScenarioDef[] = [
  { id: 'kyc',      name: 'Верификация KYC',     desc: 'Полная проверка нового клиента-физлица.',          glyph: <I.ID size={18} /> },
  { id: 'open',     name: 'Открытие счёта',       desc: 'Открытие текущего счёта для резидента.',           glyph: <I.Plus size={18} /> },
  { id: 'deposit',  name: 'Депозитные операции',  desc: 'Приём наличных и оформление срочного вклада.',     glyph: <I.Coins size={18} /> },
  { id: 'transfer', name: 'Переводы',             desc: 'Внутренние и трансграничные переводы.',            glyph: <I.Swap size={18} /> },
]

const ACTIVITY = [
  { who: 'Наставник Татьяна К.', what: 'оставила фидбэк по', target: 'тренировке KYC #14', when: '12 мин назад',  dot: 'cobalt' },
  { who: 'Вы',                   what: 'получили награду',   target: '«Первый KYC»',         when: 'Вчера · 16:42', dot: 'warm'   },
  { who: 'Поток Q2-26',          what: 'открыл модуль',      target: '«Санкции»',            when: 'Вчера · 09:10', dot: 'green'  },
  { who: 'Вы',                   what: 'завершили сценарий', target: '«KYC: разбор»',        when: 'Пн · 14:08',    dot: 'green'  },
  { who: 'HR Ольга Р.',          what: 'назначила',          target: 'квест 2-й недели',     when: 'Пн · 09:00',    dot: 'mute'   },
]

interface DashboardProps {
  onOpenBrief: () => void
}

export default function Dashboard({ onOpenBrief }: DashboardProps) {
  const navigate = useNavigate()
  const { xp, level, streak, unlockedScenarios, badges } = useUserStore()
  const startScenario = useScenarioStore(s => s.startScenario)

  const xpPct     = levelProgress(xp)
  const xpToNext  = xpToNextLevel(xp)
  const levelName = LEVEL_NAMES[level] ?? 'Уровень ' + level

  // Completed runs for average score
  const completedRuns = useUserStore(s => s.completedRuns)
  const avgScore = completedRuns.length
    ? Math.round(completedRuns.reduce((s, r) => s + r.score, 0) / completedRuns.length)
    : 0

  // Badge shelf — first 6 from BADGE_DEFS, filled if unlocked in store
  const badgeShelf = BADGE_DEFS.slice(0, 6).map(def => {
    const state = badges.find(b => b.id === def.id)
    return { ...def, unlocked: !!state?.unlockedAt }
  })

  // Total unlocked badge count
  const unlockedBadgeCount = badges.filter(b => b.unlockedAt).length

  const handleStartScenario = (displayId: string) => {
    const storeId = SCENARIO_ID_MAP[displayId]
    if (!storeId) return
    startScenario(storeId)
    navigate('/simulator/' + storeId)
  }

  const handleAskMentor = () => {
    useMessagesStore.getState().openChat('tatiana')
    navigate('/messages')
  }

  return (
    <div className="page screen-in" data-screen-label="Dashboard">
      <p className="h-eyebrow">Неделя 2 из 6 · поток Q2-26</p>
      <h1 className="h1">Доброе утро, <em>Алексей</em>.</h1>
      <p className="sub" style={{ marginTop: 8, maxWidth: 560 }}>
        Сегодня три квеста — один новый, два перешли со вчера. Наставник оставила заметки к вчерашнему KYC.
      </p>

      <div className="dash-hero" style={{ marginTop: 24 }}>
        <div className="quest" data-clicky-target="todays-quest">
          <span className="quest-mark">КВЕСТ · ДЕНЬ-08</span>
          <span className="eyebrow">Квест дня</span>
          <h2>
            Проведите чистую <em>верификацию KYC</em> синтетического клиента Ивана Соколова —
            отметьте санкционный жёлтый флаг.
          </h2>
          <div className="quest-meta">
            <span><b>~12 мин</b> · длительность</span>
            <span><b>+80 XP</b> за первое прохождение</span>
            <span><b>3 шага</b> впереди</span>
          </div>
          <div className="quest-actions">
            <button
              className="btn btn-light-on-cobalt"
              onClick={() => handleStartScenario('kyc')}
            >
              <I.Play size={13} /> Начать сценарий
            </button>
            <button className="btn btn-ghost-on-cobalt" onClick={onOpenBrief}>
              <I.Doc size={13} /> Открыть бриф
            </button>
          </div>
        </div>

        <div className="stats">
          <div className="stat">
            <span className="stat-icon"><I.Bolt size={18} /></span>
            <div style={{ flex: 1 }}>
              <div className="stat-value">{xp}<small>XP</small></div>
              <div className="stat-label">{levelName} · до следующего {xpToNext}</div>
              <div className="xp-bar" style={{ marginTop: 6 }}>
                <div className="xp-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          <div className="stat">
            <span className="stat-icon warm"><I.Flame size={18} /></span>
            <div style={{ flex: 1 }}>
              <div className="stat-value">{streak}<small>дней</small></div>
              <div className="stat-label">Серия практики</div>
              <div className="streak-dots">
                {Array.from({ length: 7 }, (_, i) => (
                  <i key={i} className={i < streak ? '' : 'miss'} />
                ))}
              </div>
            </div>
          </div>

          <div className="stat">
            <span className="stat-icon green"><I.Star size={18} /></span>
            <div style={{ flex: 1 }}>
              <div className="stat-value">
                {completedRuns.length ? avgScore : '—'}
                <small>/100</small>
              </div>
              <div className="stat-label">Средний балл</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-head">
        <div>
          <p className="h-eyebrow">Трек: операции</p>
          <h2 className="h2">Банковские сценарии</h2>
        </div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a style={{ cursor: 'pointer' }} onClick={() => navigate('/tasks')}>Все 12 →</a>
      </div>

      <div className="scenarios">
        {SCENARIO_DEFS.map(s => {
          const storeId = SCENARIO_ID_MAP[s.id]
          const isLocked = !unlockedScenarios.includes(storeId)
          // Find a completed run for this scenario to show score
          const lastRun = completedRuns
            .filter(r => r.scenarioId === storeId)
            .sort((a, b) => b.score - a.score)[0]

          return (
            <button
              key={s.id}
              className={`scenario${isLocked ? ' locked' : ''}`}
              onClick={() => !isLocked && handleStartScenario(s.id)}
              disabled={isLocked}
              title={isLocked ? `Требует: ${PREREQUISITES[s.id] ?? 'предыдущий сценарий'}` : undefined}
            >
              <div className="scenario-glyph">{s.glyph}</div>
              <div className="scenario-name">{s.name}</div>
              <div className="scenario-desc">{s.desc}</div>
              <div className="scenario-foot">
                {isLocked
                  ? <span><I.Lock size={12} style={{ verticalAlign: '-2px' }} /> Требует: {PREREQUISITES[s.id]}</span>
                  : lastRun
                    ? <span className="score-pill">{lastRun.score}/100</span>
                    : <span className="new-pill">ДАЛЕЕ</span>
                }
                <I.ChevronR size={14} style={{ opacity: 0.5 }} />
              </div>
            </button>
          )
        })}
      </div>

      <div className="dash-low">
        <div className="card">
          <div style={{ padding: '16px 20px 4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h3 className="h2">Активность</h3>
            <span style={{ font: '500 11px/1 var(--font-mono)', color: 'var(--mute)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>За 48ч</span>
          </div>
          <div style={{ padding: '0 16px 12px' }} className="activity">
            {ACTIVITY.map((a, i) => (
              <div className="activity-row" key={i}>
                <span className={`dot ${a.dot}`} />
                <div>
                  <b>{a.who}</b>{' '}
                  <span style={{ color: 'var(--mute)' }}>{a.what}</span>{' '}
                  <b>{a.target}</b>
                </div>
                <span className="when">{a.when}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px 4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h3 className="h2">Награды</h3>
            <span style={{ font: '500 11px/1 var(--font-mono)', color: 'var(--mute)' }}>
              {unlockedBadgeCount} / {BADGE_DEFS.length}
            </span>
          </div>
          <div className="badges-shelf">
            {badgeShelf.map((b, i) => (
              <div key={i} className={`badge${b.unlocked ? '' : ' locked'}`}>
                <div className={`badge-glyph${b.unlocked ? '' : ''}`}>{b.glyph}</div>
                <b>{b.name}</b>
                <span>{b.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cohort">
        <div className="stack">
          <div className="avatar">МК</div>
          <div className="avatar cobalt">ИС</div>
          <div className="avatar lilac">ОР</div>
          <div className="avatar teal">ДВ</div>
          <div className="avatar rose">+9</div>
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>Поток Q2-26 · 13 стажёров</div>
          <small>
            Вы <b style={{ color: 'var(--cobalt)' }}>впереди медианы</b> на 2 дня —
            на этой неделе доступны 4 наставника.
          </small>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-ghost" onClick={handleAskMentor}>
            <I.Chat size={13} /> Спросить наставника
          </button>
        </div>
      </div>
    </div>
  )
}
