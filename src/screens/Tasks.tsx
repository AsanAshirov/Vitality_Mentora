// Tasks.tsx — banking task list. Each task opens a scenario in the simulator.
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { useScenarioStore } from '../store/scenarioStore'
import { I } from '../components/Icons'
import type { ScenarioId } from '../store/userStore'

// ── Task definitions ──────────────────────────────────────────────────────────

interface TaskDef {
  id: string
  scenario: ScenarioId | string  // store ScenarioId or extended id for sim routing
  title: string
  desc: string
  cat: 'today' | 'week' | 'practice' | 'done'
  xp: number
  time: number
  diff: 'easy' | 'medium' | 'hard'
  due: string
  source: string
  priority: 'high' | 'med' | 'low'
  done?: boolean
  score?: number
}

export const TASK_DEFS: TaskDef[] = [
  // ── Mandatory / today
  {
    id: 'T-2148', scenario: 'kyc',
    title: 'Завершить KYC клиента Соколов И.А.',
    desc: 'Новый профиль ожидает верификации. В скрининге уже есть жёлтый флаг — обработайте его корректно.',
    cat: 'today', xp: 80, time: 12, diff: 'medium', due: 'до конца дня', source: 'Наставник', priority: 'high',
  },
  {
    id: 'T-2150', scenario: 'accounts',
    title: 'Открыть текущий счёт для Каримовой Д.Р.',
    desc: 'Клиент попросил счёт в UZS с подключением мобильного приложения. Сверьте паспорт, выберите тариф.',
    cat: 'today', xp: 50, time: 6, diff: 'easy', due: 'сегодня · 14:00', source: 'HR', priority: 'med',
  },
  {
    id: 'T-2155', scenario: 'transfers',
    title: 'Обработать SWIFT-перевод $1 400 (Турсунов А.Б.)',
    desc: 'Сейчас на проверке AML. Решите: пропустить или эскалировать в комплаенс по причине источника.',
    cat: 'today', xp: 65, time: 8, diff: 'medium', due: 'сегодня · 16:30', source: 'Авто-AML', priority: 'high',
  },

  // ── This week
  {
    id: 'T-2160', scenario: 'deposits',
    title: 'Оформить срочный вклад 24 мес (Петров Д.С.)',
    desc: 'Сумма выше 50 млн UZS — потребуется декларация ИС и проверка работодателя.',
    cat: 'week', xp: 70, time: 10, diff: 'medium', due: 'Чт · 12:00', source: 'Клиент', priority: 'med',
  },
  {
    id: 'T-2161', scenario: 'cards',
    title: 'Выпустить карту HUMO для Юлдашева Б.Ш.',
    desc: 'Заявка одобрена. Подтвердите параметры и отправьте в очередь персонализации.',
    cat: 'week', xp: 40, time: 5, diff: 'easy', due: 'Пт', source: 'Клиент', priority: 'low',
  },
  {
    id: 'T-2163', scenario: 'accounts',
    title: 'Открыть валютный счёт USD (Иванова О.В.)',
    desc: 'Клиент-резидент, без подключения SWIFT. Тариф «Резидент · валютный базовый».',
    cat: 'week', xp: 50, time: 6, diff: 'easy', due: 'Чт', source: 'Клиент', priority: 'med',
  },

  // ── Practice
  {
    id: 'T-2170', scenario: 'kyc',
    title: 'Тренировка: KYC нерезидента',
    desc: 'Дополнительная практика. Нерезидент с белорусским паспортом и адресом регистрации в РФ.',
    cat: 'practice', xp: 45, time: 10, diff: 'hard', due: '—', source: 'Mentora', priority: 'low',
  },
  {
    id: 'T-2173', scenario: 'transfers',
    title: 'Тренировка: AML-эскалация подозрительной операции',
    desc: 'Серия мелких переводов от одного отправителя на разных получателей.',
    cat: 'practice', xp: 55, time: 8, diff: 'hard', due: '—', source: 'Mentora', priority: 'low',
  },
  {
    id: 'T-2174', scenario: 'deposits',
    title: 'Тренировка: досрочное закрытие вклада',
    desc: 'Расчёт пеней и перерасчёт ставки по правилам DEPOSIT-OPS §3.2.',
    cat: 'practice', xp: 60, time: 12, diff: 'hard', due: '—', source: 'Mentora', priority: 'low',
  },

  // ── Completed
  {
    id: 'T-2140', scenario: 'kyc',
    title: 'KYC дебютной серии (тренировка)',
    desc: 'Первая полная верификация — пройдена с оценкой 87/100.',
    cat: 'done', xp: 80, time: 12, diff: 'easy', due: 'Вчера', source: 'Mentora', priority: 'low',
    done: true, score: 87,
  },
  {
    id: 'T-2141', scenario: 'cards',
    title: 'Выпуск дебетовой карты UZCARD',
    desc: 'Тренировочный сценарий — пройден с оценкой 92/100.',
    cat: 'done', xp: 40, time: 5, diff: 'easy', due: '3 дня назад', source: 'Mentora', priority: 'low',
    done: true, score: 92,
  },
]

// ── TaskCard sub-component ────────────────────────────────────────────────────

interface TaskCardProps {
  task: TaskDef
  actualScore?: number
  onLaunch: (task: TaskDef) => void
}

function TaskCard({ task, actualScore, onLaunch }: TaskCardProps) {
  const diffLabel = task.diff === 'easy' ? 'Легко' : task.diff === 'medium' ? 'Средне' : 'Сложно'
  const displayScore = actualScore ?? task.score

  return (
    <div className={`task-card${task.done ? ' done' : ''} pri-${task.priority}`}>
      <div className="tc-marker">
        {task.done ? <I.Check size={14} /> : <I.Play size={12} />}
      </div>
      <div className="tc-body">
        <div className="tc-head">
          <span className={`tag ${task.priority === 'high' ? 'warn' : task.priority === 'med' ? 'cobalt' : 'mute'}`}>
            {task.priority === 'high' ? 'Приоритет' : task.priority === 'med' ? 'Стандарт' : 'По желанию'}
          </span>
          <span className="tc-id mono">{task.id}</span>
          <span className="tc-source">от <b>{task.source}</b></span>
        </div>
        <b className="tc-title">{task.title}</b>
        <p className="tc-desc">{task.desc}</p>
        <div className="tc-meta">
          <span><I.Clock size={11} /> ~{task.time} мин</span>
          <span><I.Bolt size={11} /> +{task.xp} XP</span>
          <span><I.Star size={11} /> {diffLabel}</span>
          {task.due && <span className="tc-due">{task.due}</span>}
          {(task.done || displayScore !== undefined) && (
            <span className="tc-score mono">оценка {displayScore}/100</span>
          )}
        </div>
      </div>
      <div className="tc-action">
        {task.done ? (
          <button className="btn btn-ghost" onClick={() => onLaunch(task)}>Повторить</button>
        ) : (
          <button className="btn btn-primary" onClick={() => onLaunch(task)}>
            <I.Play size={12} /> Начать
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main TasksPage ────────────────────────────────────────────────────────────

export function TasksPage() {
  const navigate = useNavigate()
  const completedRuns = useUserStore(s => s.completedRuns)
  const [filter, setFilter] = useState<'today' | 'week' | 'practice' | 'done'>('today')

  const cats = {
    today:    TASK_DEFS.filter(t => t.cat === 'today'),
    week:     TASK_DEFS.filter(t => t.cat === 'week'),
    practice: TASK_DEFS.filter(t => t.cat === 'practice'),
    done:     TASK_DEFS.filter(t => t.cat === 'done'),
  }
  const rows = cats[filter] ?? []

  // Find the best actual score for a task from store runs
  const getActualScore = (task: TaskDef): number | undefined => {
    const storeRuns = completedRuns.filter(r => r.scenarioId === task.scenario)
    if (storeRuns.length === 0) return undefined
    return Math.max(...storeRuns.map(r => r.score))
  }

  const handleLaunch = (task: TaskDef) => {
    const storeId = task.scenario as ScenarioId
    useScenarioStore.getState().startScenario(storeId)
    navigate('/simulator/' + storeId)
  }

  return (
    <div className="page screen-in" data-screen-label="Tasks">
      <p className="h-eyebrow">Задачи · поток Q2-26</p>
      <h1 className="h1">Что <em>сделать</em> сегодня.</h1>
      <p className="sub" style={{ marginTop: 8, maxWidth: 620 }}>
        Реальные банковские задачи в синтетической среде. Каждая открывает сценарий с пошаговым
        прохождением, автопроверкой и оценкой.
      </p>

      <div className="tasks-stats">
        <div className="ts-cell">
          <div className="ts-label">К выполнению сегодня</div>
          <div className="ts-val">{cats.today.length}</div>
        </div>
        <div className="ts-cell">
          <div className="ts-label">XP за сегодня</div>
          <div className="ts-val">{cats.today.reduce((s, t) => s + t.xp, 0)}</div>
        </div>
        <div className="ts-cell">
          <div className="ts-label">На этой неделе</div>
          <div className="ts-val">{cats.week.length}</div>
        </div>
        <div className="ts-cell">
          <div className="ts-label">Тренировок доступно</div>
          <div className="ts-val">{cats.practice.length}</div>
        </div>
        <div className="ts-cell">
          <div className="ts-label">Сдано всего</div>
          <div className="ts-val">
            {cats.done.length + 8}<small>в потоке</small>
          </div>
        </div>
      </div>

      <div className="tasks-tabs">
        {([
          { id: 'today',    label: 'Сегодня',    count: cats.today.length    },
          { id: 'week',     label: 'Эта неделя', count: cats.week.length     },
          { id: 'practice', label: 'Тренировки', count: cats.practice.length },
          { id: 'done',     label: 'Сдано',      count: cats.done.length     },
        ] as const).map(t => (
          <button
            key={t.id}
            className={`tt-tab${filter === t.id ? ' active' : ''}`}
            onClick={() => setFilter(t.id)}
          >
            {t.label}
            <span className="tt-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="task-list">
        {rows.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            actualScore={getActualScore(task)}
            onLaunch={handleLaunch}
          />
        ))}
        {rows.length === 0 && (
          <div className="dt-empty">Здесь пусто. Возьмите задачу из другой вкладки.</div>
        )}
      </div>
    </div>
  )
}

export default TasksPage
