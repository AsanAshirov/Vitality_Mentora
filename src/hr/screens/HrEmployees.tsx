// HrEmployees.tsx — employee list + profile detail, ported from reference/screens/employees.jsx
import React, { useState, useRef } from 'react'
import hrData from '../hrData'
import { hrToast, MenuPopover } from '../hrToast'
import { Ihr } from '../iconsHr'
import Sparkline from '../shell/Sparkline'
import Avatar from '../shell/Avatar'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HrEmployeesProps {
  openProfile: (id: number) => void
  openChat: (id: number) => void
  openCall: (id: number | string, mode: string) => void
}

interface HrProfileProps {
  id: number
  onBack: () => void
  openChat: (id: number) => void
  openCall: (id: number | string, mode: string) => void
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type Tab = 'all' | 'risk' | 'top' | 'new' | 'Розница' | 'Корпоратив' | 'Премиум'

function scoreToTone(score: number): string {
  if (score >= 85) return 'good'
  if (score >= 70) return ''
  if (score >= 60) return 'warn'
  return 'bad'
}

function statusLabel(status: string): string {
  if (status === 'online')  return 'В сети'
  if (status === 'busy')    return 'Занят'
  if (status === 'away')    return 'Отошёл'
  return 'Не в сети'
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: filename,
  })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}

// ---------------------------------------------------------------------------
// HrEmployees
// ---------------------------------------------------------------------------

export function HrEmployees({ openProfile, openChat, openCall }: HrEmployeesProps) {
  const [tab, setTab] = useState<Tab>('all')
  const [q, setQ] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [showAddIntern, setShowAddIntern] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const moreRefs = useRef<Record<number, HTMLButtonElement | null>>({})

  let rows = hrData.EMPLOYEES
  if (tab !== 'all') {
    if (tab === 'risk')        rows = rows.filter(e => e.score < 70)
    else if (tab === 'top')    rows = rows.filter(e => e.score >= 85)
    else if (tab === 'new')    rows = rows.filter(e => e.scenarios < 10)
    else                       rows = rows.filter(e => e.team === tab)
  }
  if (q) rows = rows.filter(e => e.name.toLowerCase().includes(q.toLowerCase()))
  if (filterStatus.length > 0) rows = rows.filter(e => filterStatus.includes(e.status))

  const counts = {
    all:        hrData.EMPLOYEES.length,
    risk:       hrData.EMPLOYEES.filter(e => e.score < 70).length,
    top:        hrData.EMPLOYEES.filter(e => e.score >= 85).length,
    Розница:    hrData.EMPLOYEES.filter(e => e.team === 'Розница').length,
    Корпоратив: hrData.EMPLOYEES.filter(e => e.team === 'Корпоратив').length,
    Премиум:    hrData.EMPLOYEES.filter(e => e.team === 'Премиум').length,
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Сотрудники</h1>
          <p>26 стажёров · 3 когорты · все данные на 23 мая, 10:48 MSK</p>
        </div>
        <div className="right">
          <button
            className="btn"
            onClick={() => setShowFilter(v => !v)}
          >
            <Ihr.Filter size={14} /> Фильтр
          </button>
          <button
            className="btn"
            onClick={() => downloadCsv('employees.csv', [
              ['ID', 'Имя', 'Роль', 'Команда', 'Статус', 'Балл', 'Сценариев'],
              ...hrData.EMPLOYEES.map(e => [String(e.id), e.name, e.role, e.team, e.status, String(e.score), String(e.scenarios)])
            ])}
          >
            <Ihr.Download size={14} /> Экспорт CSV
          </button>
          <button
            className="btn primary"
            onClick={() => setShowAddIntern(v => !v)}
          >
            <Ihr.Plus size={14} /> Добавить стажёра
          </button>
        </div>
      </div>

      {showFilter && (
        <div style={{ padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--line-2)', display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--mute)' }}>Статус:</span>
          {(['online', 'busy', 'away', 'offline'] as const).map(s => {
            const labels: Record<string, string> = { online: 'В сети', busy: 'Занят', away: 'Отошёл', offline: 'Не в сети' }
            const checked = filterStatus.includes(s)
            return (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={checked} onChange={() =>
                  setFilterStatus(f => checked ? f.filter(x => x !== s) : [...f, s])
                } />{labels[s]}
              </label>
            )
          })}
          <button className="btn ghost" style={{ height: 26, fontSize: 11, marginLeft: 'auto' }} onClick={() => setFilterStatus([])}>Сбросить</button>
        </div>
      )}

      {showAddIntern && (
        <div style={{ padding: '16px', background: 'var(--surface)', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Имя</label>
            <input style={{ width: '100%', height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }} placeholder="Фамилия Имя" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Роль</label>
            <input style={{ width: '100%', height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }} placeholder="Стажёр · Розница" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Команда</label>
            <select style={{ width: '100%', height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }}>
              {hrData.COHORTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" style={{ height: 32 }} onClick={() => { hrToast('Стажёр добавлен', { kind: 'good', sub: 'Приглашение отправлено' }); setShowAddIntern(false) }}>Добавить</button>
            <button className="btn ghost" style={{ height: 32 }} onClick={() => setShowAddIntern(false)}>Отмена</button>
          </div>
        </div>
      )}

      <div className="emp-filter-bar">
        <label className="emp-search">
          <Ihr.Search size={14} />
          <input
            placeholder="Поиск по имени, команде…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </label>
        <div className="emp-filter-pills">
          <button className={'emp-pill' + (tab === 'all' ? ' active' : '')} onClick={() => setTab('all')}>
            Все<span className="count">{counts.all}</span>
          </button>
          <button className={'emp-pill' + (tab === 'risk' ? ' active' : '')} onClick={() => setTab('risk')}>
            Зона риска<span className="count">{counts.risk}</span>
          </button>
          <button className={'emp-pill' + (tab === 'top' ? ' active' : '')} onClick={() => setTab('top')}>
            Топ-перформеры<span className="count">{counts.top}</span>
          </button>
          <button className={'emp-pill' + (tab === 'Розница' ? ' active' : '')} onClick={() => setTab('Розница')}>
            Розница<span className="count">{counts['Розница']}</span>
          </button>
          <button className={'emp-pill' + (tab === 'Корпоратив' ? ' active' : '')} onClick={() => setTab('Корпоратив')}>
            Корпоратив<span className="count">{counts['Корпоратив']}</span>
          </button>
          <button className={'emp-pill' + (tab === 'Премиум' ? ' active' : '')} onClick={() => setTab('Премиум')}>
            Премиум<span className="count">{counts['Премиум']}</span>
          </button>
        </div>
      </div>

      <div className="emp-table">
        <div className="emp-table-head">
          <span>Стажёр</span>
          <span>Статус</span>
          <span>Балл</span>
          <span>Тренд · 8 недель</span>
          <span>Был онлайн</span>
          <span style={{ textAlign: 'right' }}>Действия</span>
        </div>
        {rows.map(e => {
          const tone      = scoreToTone(e.score)
          const sparkTone = e.delta > 0 ? 'good' : e.delta < 0 ? 'bad' : ''
          return (
            <div className="emp-row" key={e.id} onClick={() => openProfile(e.id)}>
              <div className="nm">
                <div className={'av ' + e.avClass}>{e.initials}</div>
                <div>
                  <b>{e.name}</b>
                  <small>{e.role}</small>
                </div>
              </div>
              <span className={'st ' + e.status}>
                {statusLabel(e.status)}
              </span>
              <span className={'score-cell ' + tone}>{e.score}</span>
              <span>
                <Sparkline data={e.trend} tone={sparkTone} />
                <span style={{
                  font: '500 11.5px/1 var(--font-mono)',
                  color: e.delta > 0 ? 'var(--good)' : e.delta < 0 ? 'var(--bad)' : 'var(--mute)',
                }}>
                  {e.delta > 0 ? '+' : ''}{e.delta}
                </span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--mute)' }}>{e.lastActive}</span>
              <div className="actions" onClick={ev => ev.stopPropagation()}>
                <button className="icon-btn" title="Сообщение"  onClick={() => openChat(e.id)}><Ihr.Message size={14} /></button>
                <button className="icon-btn" title="Звонок"     onClick={() => openCall(e.id, 'voice')}><Ihr.Phone size={14} /></button>
                <button className="icon-btn" title="Видеосвязь" onClick={() => openCall(e.id, 'video')}><Ihr.Video size={14} /></button>
                <button
                  className="icon-btn"
                  title="Ещё"
                  ref={el => { moreRefs.current[e.id] = el }}
                  onClick={() => setOpenMenuId(id => id === e.id ? null : e.id)}
                >
                  <Ihr.More size={14} />
                </button>
                <MenuPopover
                  open={openMenuId === e.id}
                  anchorRef={{ current: moreRefs.current[e.id] ?? null } as React.RefObject<HTMLElement | null>}
                  onClose={() => setOpenMenuId(null)}
                  items={[
                    { label: 'Назначить ментора', onClick: () => hrToast('Ментор назначен', { kind: 'good' }) },
                    { label: 'Добавить заметку', onClick: () => openProfile(e.id) },
                    { sep: true },
                    { label: 'Архивировать', onClick: () => hrToast('Стажёр перемещён в архив', { kind: 'warn' }) },
                  ]}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// HrProfile
// ---------------------------------------------------------------------------

export function HrProfile({ id, onBack, openChat, openCall }: HrProfileProps) {
  const e = hrData.EMPLOYEES.find(x => x.id === id)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [notes, setNotes] = useState([
    { text: 'Отличная динамика, рекомендую для повышения нагрузки', date: '18.05.2026', author: 'Ольга К.' },
    { text: 'Был замечен в помощи стажёрам из другого потока', date: '10.05.2026', author: 'Ольга К.' },
    { text: 'Запросил доп. материалы по AML — инициативный', date: '02.05.2026', author: 'Ольга К.' },
  ])

  if (!e) return null

  const kpis = [
    { lbl: 'Текущий балл',     val: e.score,   suffix: '/100', delta: (e.delta >= 0 ? '+' : '') + e.delta, dir: e.delta > 0 ? 'up' : 'down' },
    { lbl: 'Сценариев',        val: e.scenarios, suffix: '',   delta: '+3 за нед',  dir: 'up'   },
    { lbl: 'Точность ответов', val: 84,          suffix: '%',  delta: '+5%',        dir: 'up'   },
    { lbl: 'Активность',       val: '92%',        suffix: '',  delta: 'стабильно',  dir: 'flat' },
  ]

  const skills = [
    { lbl: 'Продукты · карты', pct: 92, tone: 'good' },
    { lbl: 'Антифрод',          pct: 71, tone: ''     },
    { lbl: 'Эмпатия в звонке',  pct: 86, tone: 'good' },
    { lbl: 'Эскалация',         pct: 64, tone: 'warn' },
    { lbl: 'Корп. кредит',      pct: 48, tone: 'bad'  },
    { lbl: 'Регламенты',        pct: 79, tone: ''     },
  ]

  const history = [
    { title: 'Холодный звонок · Карта Gold',  ts: 'сегодня, 10:46', score: 87, ic: 'good' },
    { title: 'Возражение по комиссии',         ts: 'пятница, 16:22', score: 76, ic: ''     },
    { title: 'Антифрод · Подозрительный счёт', ts: 'пятница, 11:08', score: 68, ic: 'warn' },
    { title: 'Эмпатия · Жалоба клиента',       ts: 'четверг, 15:30', score: 91, ic: 'good' },
    { title: 'Эскалация по ипотеке',           ts: 'среда, 17:00',   score: 64, ic: 'warn' },
    { title: 'Onboarding · Базовый',           ts: '1-я неделя',     score: 95, ic: 'good' },
  ]

  return (
    <div className="page">
      <button className="back-link" onClick={onBack}>
        <Ihr.ArrowL size={12} /> К списку сотрудников
      </button>

      <div className="profile-head">
        <div className={'av-big ' + e.avClass}>{e.initials}</div>
        <div>
          <h1>{e.name}</h1>
          <div className="role">{e.role} · Стаж: 7 недель</div>
          <div className="tag-row">
            <span className={'st ' + e.status}>
              {statusLabel(e.status)}
            </span>
            <span className="tag cobalt">Когорта 2026/04</span>
            <span className="tag">Ментор: Е. Соколова</span>
            <span className="tag good">↑ Топ-25%</span>
          </div>
        </div>
        <div className="pa">
          <button className="pa-btn" onClick={() => openChat(e.id)}><Ihr.Message size={14} /> Написать</button>
          <button className="pa-btn" onClick={() => openCall(e.id, 'voice')}><Ihr.Phone size={14} /> Звонок</button>
          <button className="pa-btn primary" onClick={() => openCall(e.id, 'video')}><Ihr.Video size={14} /> Видеосвязь</button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <span className="lbl">{k.lbl}</span>
            <span className="val">{k.val}<small>{k.suffix}</small></span>
            <span className={'delta ' + (k.dir === 'down' ? 'down' : k.dir === 'flat' ? 'flat' : '')}>
              {k.dir === 'up'   ? <Ihr.ArrowUp size={10} /> : null}
              {k.dir === 'down' ? <Ihr.ArrowDn size={10} /> : null}
              {k.delta}
            </span>
          </div>
        ))}
      </div>

      <div className="profile-grid">
        <div>
          <div className="scenario-history">
            <div className="ch">
              <h3>История сценариев</h3>
              <span>последние 6</span>
            </div>
            {history.map((h, i) => (
              <div
                className="sh-row"
                key={i}
                style={{ cursor: 'pointer' }}
                onClick={() => {}}
              >
                <div className={'sh-icn ' + (h.ic || '')}>
                  <Ihr.Activity size={14} />
                </div>
                <div className="sh-name">
                  <b>{h.title}</b>
                  <small>{h.ts}</small>
                </div>
                <span
                  className={'score-x ' + (h.score >= 85 ? 'good' : h.score >= 70 ? 'mute' : h.score >= 60 ? 'warn' : 'bad')}
                  style={{ textAlign: 'center' }}
                >
                  {h.score}
                </span>
                <button
                  className="btn ghost"
                  style={{ height: 28, fontSize: 11.5 }}
                  onClick={ev => { ev.stopPropagation() }}
                >
                  Запись →
                </button>
              </div>
            ))}
          </div>

          <div className="notes-card">
            <h3>Заметки HR <span>{notes.length} записи</span></h3>
            {notes.map((n, i) => (
              <div className="note-it" key={i}>
                <b>{n.author}</b>
                {n.text}
                <div className="meta"><span>{n.author}</span><span>{n.date}</span></div>
              </div>
            ))}
            <button
              className="btn"
              style={{ marginTop: 10, width: '100%' }}
              onClick={() => setShowNoteForm(v => !v)}
            >
              <Ihr.Plus size={12} /> Добавить заметку
            </button>
            {showNoteForm && (
              <div style={{ marginTop: 10 }}>
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder="Текст заметки…"
                  style={{ width: '100%', height: 72, padding: '8px 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12, resize: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn primary" style={{ height: 28, fontSize: 12 }} onClick={() => {
                    if (!noteInput.trim()) return
                    setNotes(n => [{ text: noteInput, date: 'Сейчас', author: 'Ольга К.' }, ...n])
                    setNoteInput(''); setShowNoteForm(false)
                    hrToast('Заметка добавлена', { kind: 'good' })
                  }}>Добавить</button>
                  <button className="btn ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setShowNoteForm(false)}>Отмена</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="skills-card">
            <h3>Навыки <span>Радар компетенций</span></h3>
            {skills.map((s, i) => (
              <div className="skill-row" key={i}>
                <span className="lbl">{s.lbl}</span>
                <span className="bar"><i className={s.tone} style={{ width: s.pct + '%' }} /></span>
                <span className="pct">{s.pct}</span>
              </div>
            ))}
          </div>

          <div className="notes-card">
            <h3>Ближайшие события <span>3</span></h3>
            <div
              className="note-it"
              style={{ cursor: 'pointer' }}
              onClick={() => {}}
            >
              <b>1:1 встреча · среда, 11:30</b>
              Разбор записи «Холодный звонок · Карта Gold»
              <div className="meta"><span>с Ольгой Карповой</span><span>30 мин</span></div>
            </div>
            <div
              className="note-it"
              style={{ cursor: 'pointer' }}
              onClick={() => {}}
            >
              <b>Пересдача модуля «Антифрод»</b>
              Дедлайн — пятница, 17:00
              <div className="meta"><span>3 попытки</span><span>~45 мин</span></div>
            </div>
            <div
              className="note-it"
              style={{ cursor: 'pointer' }}
              onClick={() => {}}
            >
              <b>Калибровка когорты</b>
              Видеовстреча с 4 ментрами
              <div className="meta"><span>четверг, 16:00</span><span>1 час</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
