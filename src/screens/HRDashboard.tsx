// HRDashboard.tsx — HR manager view: trainee progress, cohort stats, assignments
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { I } from '../components/Icons'

// ─── Synthetic trainee data ───────────────────────────────────────────────────

interface Trainee {
  id: string; name: string; short: string; cohort: string
  level: number; xp: number; xpMax: number; streak: number
  scenarios: number; scenariosMax: number; lastActive: string
  status: 'active' | 'inactive' | 'at-risk'; avgScore: number; badge?: string
}

const TRAINEES: Trainee[] = [
  { id:'TR-01', name:'Алексей Павлов',      short:'АП', cohort:'Q2-2026', level:4, xp:1240, xpMax:1500, streak:12, scenarios:4, scenariosMax:5, lastActive:'Сегодня 07:42', status:'active',   avgScore:87, badge:'🏆' },
  { id:'TR-02', name:'Сабина Рустамова',    short:'СР', cohort:'Q2-2026', level:3, xp:980,  xpMax:1200, streak:8,  scenarios:3, scenariosMax:5, lastActive:'Сегодня 06:31', status:'active',   avgScore:82 },
  { id:'TR-03', name:'Дониёр Хамидов',      short:'ДХ', cohort:'Q2-2026', level:3, xp:840,  xpMax:1200, streak:5,  scenarios:3, scenariosMax:5, lastActive:'Вчера 18:14',   status:'active',   avgScore:78 },
  { id:'TR-04', name:'Камолиддин Юсупов',   short:'КЮ', cohort:'Q2-2026', level:2, xp:520,  xpMax:800,  streak:3,  scenarios:2, scenariosMax:5, lastActive:'Вчера 14:02',   status:'active',   avgScore:71 },
  { id:'TR-05', name:'Зарина Мирзаева',     short:'ЗМ', cohort:'Q2-2026', level:2, xp:480,  xpMax:800,  streak:1,  scenarios:2, scenariosMax:5, lastActive:'2 дня назад',   status:'inactive', avgScore:65 },
  { id:'TR-06', name:'Фирдавс Назаров',     short:'ФН', cohort:'Q2-2026', level:2, xp:390,  xpMax:800,  streak:0,  scenarios:1, scenariosMax:5, lastActive:'4 дня назад',   status:'at-risk',  avgScore:58 },
  { id:'TR-07', name:'Нилуфар Ахмадова',    short:'НА', cohort:'Q2-2026', level:3, xp:910,  xpMax:1200, streak:7,  scenarios:3, scenariosMax:5, lastActive:'Сегодня 08:05', status:'active',   avgScore:80 },
  { id:'TR-08', name:'Бобур Тошматов',      short:'БТ', cohort:'Q1-2026', level:5, xp:1880, xpMax:2000, streak:21, scenarios:5, scenariosMax:5, lastActive:'Сегодня 07:55', status:'active',   avgScore:93, badge:'⭐' },
  { id:'TR-09', name:'Гулноза Рашидова',    short:'ГР', cohort:'Q1-2026', level:4, xp:1420, xpMax:1500, streak:14, scenarios:5, scenariosMax:5, lastActive:'Сегодня 06:18', status:'active',   avgScore:89, badge:'🥇' },
  { id:'TR-10', name:'Улугбек Содиков',     short:'УС', cohort:'Q1-2026', level:4, xp:1310, xpMax:1500, streak:9,  scenarios:5, scenariosMax:5, lastActive:'Вчера 20:44',   status:'active',   avgScore:85 },
  { id:'TR-11', name:'Матлуба Каримова',    short:'МК', cohort:'Q1-2026', level:3, xp:760,  xpMax:1200, streak:2,  scenarios:3, scenariosMax:5, lastActive:'3 дня назад',   status:'inactive', avgScore:69 },
  { id:'TR-12', name:'Жамшид Бекмуродов',  short:'ЖБ', cohort:'Q3-2026', level:1, xp:180,  xpMax:400,  streak:4,  scenarios:1, scenariosMax:5, lastActive:'Вчера 11:30',   status:'active',   avgScore:72 },
]

const COHORTS = ['Все потоки', 'Q1-2026', 'Q2-2026', 'Q3-2026']

const ASSIGNMENTS = [
  { id:'A-01', title:'Модуль KYC — обязательный',      cohort:'Q2-2026', due:'2026-06-01', done:7, total:8, type:'scenario' },
  { id:'A-02', title:'Читать AML-HB §1–5',             cohort:'Q2-2026', due:'2026-05-28', done:6, total:8, type:'reading'  },
  { id:'A-03', title:'Сценарий «Открытие счёта»',       cohort:'Q2-2026', due:'2026-06-08', done:4, total:8, type:'scenario' },
  { id:'A-04', title:'Тест по санкционным процедурам',  cohort:'Q1-2026', due:'2026-05-26', done:4, total:4, type:'test'     },
  { id:'A-05', title:'Финальный сценарий «Переводы»',   cohort:'Q1-2026', due:'2026-05-30', done:3, total:4, type:'scenario' },
  { id:'A-06', title:'Вводный инструктаж',              cohort:'Q3-2026', due:'2026-06-15', done:1, total:3, type:'reading'  },
]

const HR_ACTIVITY = [
  { t:'Сегодня 07:42', who:'Алексей П.',   what:'завершил сценарий «KYC»',          score:87,   tag:'scenario' },
  { t:'Сегодня 06:31', who:'Сабина Р.',    what:'начала сценарий «Открытие счёта»', score:null, tag:'started'  },
  { t:'Вчера 20:44',   who:'Улугбек С.',   what:'завершил все 5 сценариев',         score:85,   tag:'complete' },
  { t:'Вчера 18:14',   who:'Дониёр Х.',    what:'завершил сценарий «Санкции»',      score:78,   tag:'scenario' },
  { t:'Вчера 14:02',   who:'Камолиддин Ю.',what:'завершил KYC (2-я попытка)',       score:71,   tag:'scenario' },
  { t:'Вчера 11:30',   who:'Жамшид Б.',    what:'зарегистрировался в Q3-2026',     score:null, tag:'join'     },
  { t:'2 дня назад',   who:'Фирдавс Н.',   what:'не активен 4 дня — риск отставания', score:null, tag:'risk'  },
  { t:'3 дня назад',   who:'Гулноза Р.',   what:'получила награду «Перфекционист»', score:null, tag:'badge'   },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = (s: Trainee['status']) =>
  s === 'active' ? 'var(--good)' : s === 'at-risk' ? 'var(--bad)' : 'var(--warn)'
const statusLabel = (s: Trainee['status']) =>
  s === 'active' ? 'Активен' : s === 'at-risk' ? 'Под риском' : 'Неактивен'
const tagColor = (t: string) =>
  t === 'risk' ? 'var(--bad)' : t === 'complete' ? 'var(--good)' : t === 'badge' ? 'var(--warn)' : 'var(--cobalt)'

function Bar({ pct, color = 'var(--cobalt)' }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 5, borderRadius: 3, background: 'var(--line)', overflow: 'hidden', minWidth: 60 }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3 }} />
    </div>
  )
}

// ─── HRDashboard ──────────────────────────────────────────────────────────────

export default function HRDashboard() {
  const navigate = useNavigate()
  const [cohort, setCohort] = useState('Все потоки')
  const [sort, setSort] = useState<'xp' | 'score' | 'streak'>('xp')

  const filtered = TRAINEES
    .filter(t => cohort === 'Все потоки' || t.cohort === cohort)
    .sort((a, b) => sort === 'xp' ? b.xp - a.xp : sort === 'score' ? b.avgScore - a.avgScore : b.streak - a.streak)

  const total    = filtered.length
  const active   = filtered.filter(t => t.status === 'active').length
  const atRisk   = filtered.filter(t => t.status === 'at-risk').length
  const avgScore = Math.round(filtered.reduce((s, t) => s + t.avgScore, 0) / (total || 1))
  const avgStreak= Math.round(filtered.reduce((s, t) => s + t.streak,   0) / (total || 1))

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      fontFamily: 'var(--font-sans, system-ui)',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 28px', borderBottom: '1px solid var(--line)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 30, height: 30, borderRadius: 8, background: 'var(--cobalt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>M</span>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Mentora</span>
          <span style={{
            padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: 'var(--cobalt-50)', color: 'var(--cobalt)',
          }}>HR</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {COHORTS.map(c => (
            <button key={c} onClick={() => setCohort(c)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
              border: '1px solid var(--line)',
              background: cohort === c ? 'var(--cobalt)' : 'var(--surface-2)',
              color: cohort === c ? '#fff' : 'var(--ink)',
              cursor: 'pointer',
            }}>{c}</button>
          ))}
          <button onClick={() => navigate('/portal')} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12,
            border: '1px solid var(--line)', background: 'transparent',
            color: 'var(--mute)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, marginLeft: 8,
          }}>⇄ Сменить портал</button>
        </div>
      </div>

      <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
        {/* ── Page title ── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>HR Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--mute)', margin: '3px 0 0' }}>
            Ольга Р. · {cohort === 'Все потоки' ? 'Все потоки' : 'Поток ' + cohort}
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Стажёров',       value: total,           icon: <I.User size={15} />,  color: 'var(--cobalt)' },
            { label: 'Активны',        value: active,          icon: <I.Flame size={15} />, color: 'var(--good)'   },
            { label: 'Под риском',     value: atRisk,          icon: <I.Shield size={15} />,color: 'var(--bad)'    },
            { label: 'Средний балл',   value: avgScore + '%',  icon: <I.Star size={15} />,  color: 'var(--warn)'   },
            { label: 'Средняя серия',  value: avgStreak + ' д',icon: <I.Bolt size={15} />,  color: 'var(--cobalt)' },
          ].map(s => (
            <div key={s.label} className="surface-card" style={{ padding: '14px 16px', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, color: s.color }}>
                {s.icon}
                <span style={{ fontSize: 11, color: 'var(--mute)', fontWeight: 500 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, alignItems: 'start' }}>

          {/* ── Left col ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Trainee table */}
            <div className="surface-card" style={{ borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Стажёры</span>
                <div style={{ display: 'flex', gap: 5 }}>
                  {(['xp', 'score', 'streak'] as const).map(k => (
                    <button key={k} onClick={() => setSort(k)} style={{
                      padding: '3px 9px', borderRadius: 12, fontSize: 11,
                      border: '1px solid var(--line)',
                      background: sort === k ? 'var(--cobalt-50)' : 'transparent',
                      color: sort === k ? 'var(--cobalt)' : 'var(--mute)',
                      cursor: 'pointer',
                    }}>{k === 'xp' ? 'XP' : k === 'score' ? 'Балл' : 'Серия'}</button>
                  ))}
                </div>
              </div>
              <div className="dt-head" style={{ gridTemplateColumns: '28px 1fr 80px 90px 90px 72px 88px', padding: '0 16px' }}>
                <span>#</span><span>Имя</span><span>Поток</span><span>XP</span><span>Сценарии</span><span>Балл</span><span>Статус</span>
              </div>
              {filtered.map((t, i) => (
                <div key={t.id} className="dt-row" style={{ gridTemplateColumns: '28px 1fr 80px 90px 90px 72px 88px', padding: '0 16px', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--mute)', fontWeight: 600 }}>{i + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--cobalt-50)', color: 'var(--cobalt)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                    }}>{t.short}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name} {t.badge}</div>
                      <div style={{ fontSize: 11, color: 'var(--mute)' }}>{t.lastActive}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--mute)' }}>{t.cohort}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{t.xp} <span style={{ color: 'var(--mute)', fontWeight: 400 }}>/{t.xpMax}</span></div>
                    <Bar pct={Math.round(t.xp / t.xpMax * 100)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, marginBottom: 3 }}>{t.scenarios}/{t.scenariosMax}</div>
                    <Bar pct={Math.round(t.scenarios / t.scenariosMax * 100)} color="var(--good)" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.avgScore >= 80 ? 'var(--good)' : t.avgScore >= 60 ? 'var(--warn)' : 'var(--bad)' }}>{t.avgScore}%</span>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                    background: statusColor(t.status) + '22', color: statusColor(t.status),
                  }}>{statusLabel(t.status)}</span>
                </div>
              ))}
            </div>

            {/* Assignments */}
            <div className="surface-card" style={{ borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Задания</span>
                <button style={{
                  padding: '4px 11px', borderRadius: 20, fontSize: 12,
                  background: 'var(--cobalt)', color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}><I.Plus size={11} /> Новое</button>
              </div>
              {ASSIGNMENTS.filter(a => cohort === 'Все потоки' || a.cohort === cohort).map(a => {
                const pct = Math.round(a.done / a.total * 100)
                const icon = a.type === 'scenario' ? <I.Sim size={13} /> : a.type === 'test' ? <I.Check size={13} /> : <I.Book size={13} />
                return (
                  <div key={a.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: 'var(--cobalt)', flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{a.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bar pct={pct} color={pct === 100 ? 'var(--good)' : 'var(--cobalt)'} />
                        <span style={{ fontSize: 11, color: 'var(--mute)', whiteSpace: 'nowrap' }}>{a.done}/{a.total}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--mute)' }}>до {a.due.slice(5)}</div>
                      <div style={{ fontSize: 11, color: 'var(--mute)' }}>{a.cohort}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? 'var(--good)' : 'var(--cobalt)' }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right col: activity feed ── */}
          <div className="surface-card" style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Активность</span>
            </div>
            {HR_ACTIVITY.map((a, i) => (
              <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5, background: tagColor(a.tag) }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>{a.who}</span> {a.what}
                    {a.score !== null && (
                      <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: a.score >= 80 ? 'var(--good)' : a.score >= 60 ? 'var(--warn)' : 'var(--bad)' }}>
                        {a.score}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2 }}>{a.t}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
