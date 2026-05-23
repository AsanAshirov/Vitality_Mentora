// Results.tsx — scenario score screen (RU)
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { getMentorFeedback, levelProgress, xpToNextLevel, LEVEL_NAMES } from '../lib/progression'
import { BADGE_DEFS } from '../lib/badges'
import { I } from '../components/Icons'

interface ResultsProps {
  onRetry: () => void
  onContinue: () => void
}

export function ResultsPage({ onRetry, onContinue }: ResultsProps) {
  const navigate = useNavigate()
  const completedRuns = useUserStore(s => s.completedRuns)
  const xp = useUserStore(s => s.xp)
  const level = useUserStore(s => s.level)

  // Use the last completed run
  const run = completedRuns.length > 0 ? completedRuns[completedRuns.length - 1] : null

  // No run yet — show empty state
  if (!run) {
    return (
      <div className="page screen-in" data-screen-label="Results">
        <p className="h-eyebrow">Результаты</p>
        <h1 className="h1">Нет данных.</h1>
        <p className="sub" style={{ marginTop: 8 }}>
          Вы ещё не прошли ни одного сценария.
        </p>
        <div style={{ marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <I.Arrow size={13} /> На главную
          </button>
        </div>
      </div>
    )
  }

  // ── Derived values ───────────────────────────────────────────────────────────

  const { score, grade, xpEarned, timeMs, hintsUsed, steps, newBadges, scenarioId } = run
  const mistakeKeys = (run as any).mistakeKeys as string[] | undefined

  const gradeColor =
    grade === 'A'        ? 'var(--good)'   :
    grade === 'B'        ? 'var(--cobalt)' :
    grade === 'C'        ? 'var(--warn)'   :
    /* ПЕРЕСДАТЬ */        'var(--bad)'

  // Format time
  const totalSec = Math.round(timeMs / 1000)
  const timeMin  = Math.floor(totalSec / 60)
  const timeSec  = totalSec % 60
  const timeStr  = `${timeMin}м ${timeSec}с`

  // Mentor feedback
  const feedback = getMentorFeedback(scenarioId, grade, mistakeKeys ?? [])

  // New badges earned this run
  const earnedBadges = (newBadges ?? []).map(id => BADGE_DEFS.find(b => b.id === id)).filter(Boolean) as typeof BADGE_DEFS

  // XP bar for level progress
  const xpPct    = levelProgress(xp)
  const xpToNext = xpToNextLevel(xp)
  const levelName = LEVEL_NAMES[level] ?? 'Уровень ' + level

  // Heading text based on grade
  const heading =
    grade === 'A'        ? <h1 className="h1">Вы прошли всё <em>по инструкции</em>.</h1>   :
    grade === 'ПЕРЕСДАТЬ' ? <h1 className="h1">Это <em>серьёзный промах</em>.</h1>           :
    /* B / C */             <h1 className="h1">Неплохо, почти <em>получилось</em>.</h1>

  const subtitle =
    grade === 'A'
      ? 'Вы правильно обработали все шаги сценария. Именно такое решение требует процедура.'
      : grade === 'ПЕРЕСДАТЬ'
        ? 'Было допущено критическое нарушение. Пересмотрите блок с ошибкой ниже и повторите сценарий.'
        : 'Есть несколько мест для улучшения. Пересмотрите шаги с замечаниями ниже.'

  // Error count from steps (pts < 0 or pct < 100 and cls = "bad")
  const errorCount = (mistakeKeys ?? []).length

  return (
    <div className="page screen-in" data-screen-label="Scenario Results">
      <p className="h-eyebrow">
        Сценарий · {scenarioId} · {new Date(run.completedAt).toLocaleDateString('ru-RU')}
      </p>
      {heading}
      <p className="sub" style={{ marginTop: 8, maxWidth: 580 }}>{subtitle}</p>

      <div className="results" style={{ marginTop: 28 }}>
        {/* ── Left column ── */}
        <div>
          <div className="score-hero">
            <span className="score-grade" style={{ background: gradeColor }}>
              Оценка · {grade}
            </span>
            <div className="score-number">
              {score}<small>/ 100</small>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 8, color: 'var(--mute)', fontSize: 13 }}>
              <span>
                Время · <b style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{timeStr}</b>
              </span>
              <span>
                Ошибок · <b style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{errorCount}</b>
              </span>
              <span>
                Подсказок · <b style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{hintsUsed}</b>
              </span>
            </div>

            {/* Score breakdown from run.steps */}
            {steps && steps.length > 0 && (
              <div className="breakdown">
                {steps.map((b, i) => (
                  <div className="bd-row" key={i}>
                    <span>{b.label}</span>
                    <div className="meter">
                      <i
                        className={b.pts < 0 ? 'bad' : b.pct < 100 ? 'warn' : ''}
                        style={{ width: `${Math.max(0, b.pct)}%` }}
                      />
                    </div>
                    <span className="pts">{b.pts > 0 ? `+${b.pts}` : b.pts} баллов</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Mentor feedback / mistakes ── */}
          <div style={{ marginTop: 22 }}>
            <h2 className="h2" style={{ marginBottom: 12 }}>Разбор · что запомнить</h2>

            {/* Mistake blocks from mistakeKeys */}
            {(mistakeKeys ?? []).map(key => {
              const MISTAKE_COPY: Record<string, { title: string; body: string; corr: string }> = {
                sanctions_override: {
                  title: 'Вы проигнорировали совпадение ПДЛ с уверенностью 72%.',
                  body:  'Справочник однозначен: любое совпадение с уверенностью выше 50% требует эскалации в комплаенс, независимо от мнения стажёра.',
                  corr:  'Открыть тикет в комплаенсе и уведомить наставника в течение 15 минут. SANCTIONS-PROC §1.4',
                },
                sanctions_cleared: {
                  title: '«Отметить как очищенное» здесь не подходит.',
                  body:  'Очистка уместна при уверенности ниже ~50% и без совпадения ДР. Здесь — 72% и расхождение по дате рождения всего 4 дня.',
                  corr:  'Эскалировать в комплаенс. SANCTIONS-PROC §1.4',
                },
                missing_sof: {
                  title: 'Пропущена декларация источника средств.',
                  body:  'При сумме ≥ 50 млн UZS обязательна декларация источника средств (2-НДФЛ). Без неё оформление депозита невозможно.',
                  corr:  'Запросить у клиента 2-НДФЛ или альтернативный документ. DEPOSIT-OPS §3.2',
                },
                aml_not_escalated: {
                  title: 'Перевод проведён без эскалации AML.',
                  body:  'Операция превышает AML-порог и требует проверки комплаенса перед исполнением. Самостоятельное проведение — нарушение процедуры.',
                  corr:  'Заморозить операцию и создать тикет в комплаенс. TRANSFER-OPS §5.3',
                },
              }
              const copy = MISTAKE_COPY[key]
              if (!copy) return null
              return (
                <div className="mistake bad" key={key}>
                  <b>{copy.title}</b>
                  <p>{copy.body}</p>
                  <div className="corr"><b>Правильно:</b> {copy.corr}</div>
                </div>
              )
            })}

            {/* Generic mentor note */}
            <div className="mistake">
              <b>{feedback.title}</b>
              <p>{feedback.note}</p>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="results-side">
          {/* XP burst */}
          <div className="xp-burst">
            <small>Получено XP</small>
            <div className="num">+{xpEarned} <em>XP</em></div>
            <div className="levelbar"><i style={{ width: `${xpPct}%` }} /></div>
            <div className="levelmeta">
              <span>Ур. {level} · {levelName}</span>
              <span>{xpToNext} до ур. {level + 1}</span>
            </div>
          </div>

          {/* New badges */}
          {earnedBadges.map(b => (
            <div className="new-badge" key={b.id}>
              <div className="glyph">{b.glyph}</div>
              <div>
                <b>Новая награда · <em>{b.name}</em></b>
                <small>{b.desc}</small>
              </div>
            </div>
          ))}

          {/* What's next card */}
          <div className="card card-pad">
            <h3 className="h3" style={{ marginBottom: 10 }}>Что дальше</h3>
            <p className="sub" style={{ marginBottom: 12 }}>
              {grade === 'A'
                ? 'Следующий сценарий откроется завтра. Наставник просмотрит этот прогон.'
                : 'Пройдите сценарий ещё раз, чтобы улучшить результат, или попросите наставника о разборе.'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={onContinue}>
                <I.Arrow size={13} /> На главную
              </button>
              <button className="btn btn-ghost" onClick={onRetry}>
                Пройти заново
              </button>
            </div>
          </div>

          {/* Mentor note card */}
          <div className="card card-pad" style={{ background: 'var(--surface-2)', borderStyle: 'dashed' }}>
            <h3 className="h3" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <I.Chat size={13} /> Заметка наставника
            </h3>
            <p className="sub" style={{ fontStyle: 'italic' }}>
              «{feedback.note}» — Татьяна К.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
