// HrExtra.tsx — Calendar, Requests, Rewards, Settings (ported from reference/screens/extra.jsx)
import { useState, Fragment } from 'react'
import hrData from '../hrData'
import { hrToast } from '../hrToast'
import { Ihr } from '../iconsHr'
import type { RequestItem, CalendarEvent } from '../hrTypes'

/* ============ helpers ============ */

function downloadCsv(filename: string, rows: (string | number | undefined | null)[][]) {
  const csv = rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

/* ============ Calendar ============ */

export function HrCalendar({
  openCall,
  openProfile,
}: {
  openCall?: (id: number | string, mode: string) => void
  openProfile?: (id: number) => void
}) {
  const [week, setWeek] = useState(0)
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showNewEvent, setShowNewEvent] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDay, setNewDay] = useState('0')
  const [newStart, setNewStart] = useState('10:00')

  const days = ["Пн", "Вт", "Ср", "Чт", "Пт"]
  const dates = ["23", "24", "25", "26", "27"]
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17]

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Календарь</h1>
          <p>{hrData.CALENDAR_EVENTS.length} событий на этой неделе · 16 стажёров на 1:1 за месяц</p>
        </div>
        <div className="right">
          <button className="btn" onClick={() => hrToast("Календарь синхронизирован с Outlook · 16 событий", { kind: "good" })}>
            <Ihr.Swap size={14} /> Синхронизировать
          </button>
          <button className="btn primary" onClick={() => setShowNewEvent(v => !v)}>
            <Ihr.Plus size={14} /> Новая встреча
          </button>
        </div>
      </div>

      {showNewEvent && (
        <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 120px 90px 90px auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Название</label>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Тема встречи"
              style={{ width: '100%', height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>День</label>
            <select value={newDay} onChange={e => setNewDay(e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }}>
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт'].map((d, i) => <option key={i} value={String(i)}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Начало</label>
            <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Конец</label>
            <input type="time" defaultValue="12:00"
              style={{ width: '100%', height: 32, padding: '0 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" style={{ height: 32, whiteSpace: 'nowrap' }} onClick={() => {
              if (!newTitle.trim()) return
              hrToast('Встреча создана', { kind: 'good', sub: newTitle })
              setNewTitle(''); setShowNewEvent(false)
            }}>Создать</button>
            <button className="btn ghost" style={{ height: 32 }} onClick={() => setShowNewEvent(false)}>✕</button>
          </div>
        </div>
      )}

      <div className="cal-head">
        <div className="nav">
          <button className="icon-btn" onClick={() => { setWeek(w => w - 1); hrToast("Неделя 7 · 16–22 мая") }}><Ihr.ArrowL size={14} /></button>
          <b>23 — 27 мая 2026</b>
          <button className="icon-btn" onClick={() => { setWeek(w => w + 1); hrToast("Неделя 9 · 30 мая – 5 июня") }}><Ihr.Arrow size={14} /></button>
          <button className="btn ghost" style={{ height: 28, fontSize: 12, marginLeft: 8 }} onClick={() => { setWeek(0); hrToast("К текущей неделе", { kind: "good" }) }}>Сегодня</button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn"
            style={{ height: 28, fontSize: 12, ...(viewMode === 'week' ? { background: 'var(--surface-2)' } : {}) }}
            onClick={() => setViewMode('week')}
          >Неделя</button>
          <button
            className="btn ghost"
            style={{ height: 28, fontSize: 12, ...(viewMode === 'month' ? { background: 'var(--surface-2)' } : {}) }}
            onClick={() => setViewMode('month')}
          >Месяц</button>
          <button
            className="btn ghost"
            style={{ height: 28, fontSize: 12, ...(viewMode === 'day' ? { background: 'var(--surface-2)' } : {}) }}
            onClick={() => setViewMode('day')}
          >День</button>
        </div>
      </div>

      {viewMode === 'week' && (
        <div className="cal-grid">
          <div className="cal-corner" />
          {days.map((d, i) => (
            <div key={d} className={"cal-day-head" + (i === 0 ? " today" : "")}>
              {d}
              <b>{dates[i]}</b>
            </div>
          ))}

          {hours.map(h => (
            <Fragment key={h}>
              <div className="cal-hour">{h}:00</div>
              {days.map((d, di) => {
                const evs = hrData.CALENDAR_EVENTS.filter(e => e.day === di && Math.floor(e.start) === h)
                return (
                  <div key={d + h} className="cal-cell">
                    {evs.map((e, ei) => {
                      const dur = e.end - e.start
                      const topPct = ((e.start - h) * 100)
                      return (
                        <div
                          key={ei}
                          className={"cal-event " + e.kind}
                          style={{ top: topPct + "%", height: (dur * 56 - 4) + "px" }}
                          onClick={() => setSelectedEvent(e)}
                        >
                          <b>{e.title}</b>
                          <small>{formatTime(e.start)}–{formatTime(e.end)}</small>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      )}

      {viewMode === 'month' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, marginTop: 8 }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--mute)', padding: '6px 0', fontWeight: 500 }}>{d}</div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 3
            const evs = hrData.CALENDAR_EVENTS.filter(e => e.day === i % 5 && day >= 0 && day < 30)
            return (
              <div key={i} style={{ minHeight: 60, padding: '4px 6px', background: i % 5 < 5 && day >= 0 && day < 30 ? 'var(--surface)' : 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
                onClick={() => evs[0] && setSelectedEvent(evs[0])}>
                <div style={{ fontSize: 11, color: day < 0 || day >= 30 ? 'var(--mute-3)' : 'var(--ink)', marginBottom: 2 }}>{day >= 0 && day < 30 ? day + 1 : ''}</div>
                {evs.slice(0, 2).map((e, ei) => (
                  <div key={ei} style={{ fontSize: 9, padding: '1px 4px', borderRadius: 2, background: 'var(--cobalt-tint)', color: 'var(--cobalt)', marginBottom: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{e.title}</div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'day' && (
        <div style={{ marginTop: 8 }}>
          {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => {
            const evs = hrData.CALENDAR_EVENTS.filter(e => e.day === 0 && Math.floor(e.start) === h)
            return (
              <div key={h} style={{ display: 'grid', gridTemplateColumns: '50px 1fr', borderBottom: '1px solid var(--line)', minHeight: 48 }}>
                <div style={{ fontSize: 11, color: 'var(--mute)', padding: '8px 0' }}>{h}:00</div>
                <div style={{ padding: '4px 8px' }}>
                  {evs.map((e, ei) => (
                    <div key={ei} onClick={() => setSelectedEvent(e)}
                      style={{ padding: '4px 8px', background: 'var(--cobalt-tint)', borderLeft: '3px solid var(--cobalt)', borderRadius: 'var(--r-sm)', marginBottom: 4, cursor: 'pointer', fontSize: 12 }}>
                      <b>{e.title}</b> <span style={{ color: 'var(--mute)' }}>{e.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedEvent && (
        <div style={{ position: 'fixed', right: 0, top: 52, width: 280, height: 'calc(100vh - 52px)', background: 'var(--surface)', borderLeft: '1px solid var(--line)', padding: '20px 18px', zIndex: 100, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{selectedEvent.title}</h3>
            <button className="btn ghost" style={{ height: 28, width: 28, padding: 0 }} onClick={() => setSelectedEvent(null)}>✕</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 8 }}>{selectedEvent.sub}</div>
          <div style={{ fontSize: 12, marginBottom: 4 }}>🕐 {selectedEvent.start % 1 === 0 ? selectedEvent.start + ':00' : selectedEvent.start} — {selectedEvent.end % 1 === 0 ? selectedEvent.end + ':00' : selectedEvent.end}</div>
          <div style={{ fontSize: 12, color: 'var(--mute)', marginBottom: 16 }}>{['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'][selectedEvent.day]}</div>
          <button className="btn primary" style={{ width: '100%', height: 32, fontSize: 12 }} onClick={() => { hrToast('Переход в звонок…', { kind: 'good' }); setSelectedEvent(null) }}>Присоединиться</button>
        </div>
      )}
    </div>
  )
}

function formatTime(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return hh + ":" + (mm < 10 ? "0" + mm : mm)
}

/* ============ Requests ============ */

export function HrRequests() {
  const [tab, setTab] = useState("pending")
  const [items, setItems] = useState<RequestItem[]>(hrData.REQUESTS)
  const [kindFilter, setKindFilter] = useState('all')
  const [clarifyId, setClarifyId] = useState<string | null>(null)
  const [clarifyText, setClarifyText] = useState('')
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const kinds = ['all', ...Array.from(new Set(hrData.REQUESTS.map(r => r.kind)))]

  function approve(id: string) {
    setItems(its => its.map(r => r.id === id ? { ...r, status: "approved" as const } : r))
    const r = items.find(x => x.id === id)!
    const e = hrData.EMPLOYEES.find(x => x.id === r.who)!
    hrToast("Одобрено: " + r.kind.toLowerCase(), { sub: e.name, kind: "good" })
  }
  function deny(id: string) {
    setItems(its => its.filter(r => r.id !== id))
    hrToast("Заявка отклонена", { kind: "bad" })
  }

  const filtered = (tab === "all" ? items : items.filter(r => r.status === tab))
    .filter(r => kindFilter === 'all' || r.kind === kindFilter)

  const counts = {
    pending:  items.filter(r => r.status === "pending").length,
    review:   items.filter(r => r.status === "review").length,
    approved: items.filter(r => r.status === "approved").length,
    all: items.length,
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Заявки</h1>
          <p>{counts.pending} ожидают решения · {counts.review} на рассмотрении · {counts.approved} одобрено за неделю</p>
        </div>
        <div className="right">
          <button className="btn" onClick={() => hrToast("Фильтры применены")}><Ihr.Filter size={14} /> Фильтр</button>
          <button className="btn" onClick={() => {
            downloadCsv('requests.csv', [
              ['ID', 'Сотрудник', 'Тип', 'Тема', 'Дата', 'Статус', 'Примечание'],
              ...filtered.map(r => {
                const e = hrData.EMPLOYEES.find(x => x.id === r.who)
                return [r.id, e?.name ?? '', r.kind, r.subject, r.submitted, r.status, r.note]
              })
            ])
          }}><Ihr.Download size={14} /> Экспорт</button>
        </div>
      </div>

      <div className="emp-filter-pills" style={{ marginBottom: 14 }}>
        <button className={"emp-pill" + (tab === "pending" ? " active" : "")} onClick={() => setTab("pending")}>Новые<span className="count">{counts.pending}</span></button>
        <button className={"emp-pill" + (tab === "review" ? " active" : "")} onClick={() => setTab("review")}>На рассмотрении<span className="count">{counts.review}</span></button>
        <button className={"emp-pill" + (tab === "approved" ? " active" : "")} onClick={() => setTab("approved")}>Одобрено<span className="count">{counts.approved}</span></button>
        <button className={"emp-pill" + (tab === "all" ? " active" : "")} onClick={() => setTab("all")}>Все<span className="count">{counts.all}</span></button>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '8px 0', flexWrap: 'wrap' }}>
        {kinds.map(k => (
          <button key={k} className={'btn' + (kindFilter === k ? ' primary' : ' ghost')} style={{ height: 26, fontSize: 11 }}
            onClick={() => setKindFilter(k)}>{k === 'all' ? 'Все типы' : k}</button>
        ))}
      </div>

      <div className="req-list">
        <div className="req-row head">
          <span />
          <span>Стажёр / тип заявки</span>
          <span>Предмет</span>
          <span>Отправлено</span>
          <span>Статус</span>
          <span style={{ textAlign: 'right' }}>Действия</span>
        </div>
        {filtered.map(r => {
          const e = hrData.EMPLOYEES.find(x => x.id === r.who)!
          return (
            <Fragment key={r.id}>
              <div className="req-row" onClick={() => setExpandedId(id => id === r.id ? null : r.id)}>
                <div className={"av " + e.avClass}>{e.initials}</div>
                <div>
                  <b>{e.name}</b>
                  <small>{r.kind}</small>
                </div>
                <div style={{ fontSize: 12.5 }}>{r.subject}</div>
                <small style={{ fontSize: 11.5, color: 'var(--mute)' }}>{r.submitted}</small>
                <span className={"req-status " + r.status}>
                  {r.status === "pending"  ? "Ожидает" :
                   r.status === "review"   ? "На рассмотрении" :
                   r.status === "approved" ? "Одобрено" : r.status}
                </span>
                <div className="actions" onClick={(ev) => ev.stopPropagation()}>
                  {r.status !== "approved" ? <>
                    <button className="deny" onClick={() => deny(r.id)}>Отклонить</button>
                    <button onClick={() => setClarifyId(r.id)}>Уточнить</button>
                    <button className="primary" onClick={() => approve(r.id)}>Одобрить</button>
                  </> : (
                    <button
                      onClick={() => { setLoggedIds(s => new Set([...s, r.id])); hrToast('Зафиксировано в журнале', { kind: 'good' }) }}
                      disabled={loggedIds.has(r.id)}
                    >{loggedIds.has(r.id) ? 'Зафиксировано ✓' : 'В журнал'}</button>
                  )}
                </div>
              </div>

              {expandedId === r.id && (
                <div style={{ padding: '10px 16px 12px', background: 'var(--surface)', borderBottom: '1px solid var(--line-2)', fontSize: 12, color: 'var(--ink)' }}>
                  {r.note}
                </div>
              )}

              {clarifyId === r.id && (
                <div style={{ padding: '10px 12px', background: 'var(--surface)', borderTop: '1px solid var(--line-2)' }}>
                  <textarea value={clarifyText} onChange={e => setClarifyText(e.target.value)}
                    placeholder="Уточняющий вопрос…"
                    style={{ width: '100%', height: 60, padding: '6px 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12, resize: 'none', boxSizing: 'border-box', marginBottom: 6 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn primary" style={{ height: 28, fontSize: 12 }} onClick={() => { hrToast('Сообщение отправлено', { kind: 'good' }); setClarifyId(null); setClarifyText('') }}>Отправить</button>
                    <button className="btn ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setClarifyId(null)}>Отмена</button>
                  </div>
                </div>
              )}
            </Fragment>
          )
        })}
        {filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--mute)', fontSize: 13 }}>
            Нет заявок в этом разделе
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ============ Rewards ============ */

export function HrRewards({
  openProfile,
}: {
  openProfile?: (id: number) => void
}) {
  const [showHistory, setShowHistory] = useState(false)
  const [showCreateBadge, setShowCreateBadge] = useState(false)
  const [badgeName, setBadgeName] = useState('')
  const [badgeDesc, setBadgeDesc] = useState('')
  const [badgeKind, setBadgeKind] = useState<'cobalt' | 'good' | 'warn' | 'synth'>('cobalt')
  const [recipientsOpenId, setRecipientsOpenId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Награды</h1>
          <p>6 активных бейджей · 18 наград выдано в этом месяце · XP-фонд: 12 400 / 20 000</p>
        </div>
        <div className="right">
          <button className="btn" onClick={() => setShowHistory(v => !v)}><Ihr.Download size={14} /> История</button>
          <button className="btn primary" onClick={() => setShowCreateBadge(v => !v)}><Ihr.Plus size={14} /> Создать бейдж</button>
        </div>
      </div>

      {showHistory && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)', padding: '14px 16px', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600 }}>История наград · последние события</h3>
          {hrData.FEED.filter(f => f.action.includes('получил') || f.action.includes('получила') || f.tag.includes('XP')).slice(0, 6).map(f => {
            const e = hrData.EMPLOYEES.find(x => x.id === f.who)
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }}>
                <div className={'av ' + e?.avClass} style={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 9, color: 'white', flex: '0 0 24px' }}>{e?.initials}</div>
                <span><b>{e?.name}</b> {f.action} {f.target}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--mute)', fontSize: 11 }}>{f.when} назад</span>
              </div>
            )
          })}
        </div>
      )}

      {showCreateBadge && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)', padding: '16px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Название</label>
            <input value={badgeName} onChange={e => setBadgeName(e.target.value)} placeholder="Название бейджа"
              style={{ width: '100%', height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Тип</label>
            <select value={badgeKind} onChange={e => setBadgeKind(e.target.value as 'cobalt' | 'good' | 'warn' | 'synth')}
              style={{ width: '100%', height: 32, padding: '0 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13 }}>
              <option value="cobalt">Синий (достижение)</option>
              <option value="good">Зелёный (успех)</option>
              <option value="warn">Жёлтый (особый)</option>
              <option value="synth">Оранжевый (синтетика)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn primary" style={{ height: 32 }} onClick={() => {
              if (!badgeName.trim()) return
              hrToast('Бейдж создан', { kind: 'good', sub: badgeName })
              setBadgeName(''); setShowCreateBadge(false)
            }}>Создать</button>
            <button className="btn ghost" style={{ height: 32 }} onClick={() => setShowCreateBadge(false)}>✕</button>
          </div>
        </div>
      )}

      <div className="rwd-grid">
        {hrData.REWARDS.map(r => (
          <div className="rwd-card" key={r.id}>
            <div className="top">
              <div className={"rwd-icn " + r.kind}>
                {r.kind === "good"  ? <Ihr.Check size={18} /> :
                 r.kind === "warn"  ? <Ihr.Target size={18} /> :
                 r.kind === "synth" ? <Ihr.Award size={18} /> :
                 <Ihr.Award size={18} />}
              </div>
              <h3>{r.name}</h3>
              <span className="pct">{r.pct}%</span>
            </div>
            <p>{r.desc}</p>
            <div className="bar">
              <i style={{ width: r.pct + "%" }} />
            </div>
            <div className="recip">
              <div className="stack">
                {r.recipients.slice(0, 4).map(id => {
                  const e = hrData.EMPLOYEES.find(x => x.id === id)!
                  return <div className={"av " + e.avClass} key={id} title={e.name}>{e.initials}</div>
                })}
                {r.recipients.length > 4 ? <div className="av" style={{ background: 'var(--surface-2)', color: 'var(--mute)' }}>+{r.recipients.length - 4}</div> : null}
              </div>
              <span>{r.foot}</span>
            </div>
            <div className="foot">
              <button onClick={() => setRecipientsOpenId(id => id === r.id ? null : r.id)}>
                <Ihr.Team size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Получатели
              </button>
              <button onClick={() => { setEditingId(r.id); setEditName(r.name); setEditDesc(r.desc); setRecipientsOpenId(null) }}>
                Настроить
              </button>
            </div>

            {recipientsOpenId === r.id && (
              <div style={{ padding: '10px 12px', background: 'var(--surface-2)', borderTop: '1px solid var(--line-2)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--mute)' }}>Получатели:</span>
                {r.recipients.map(id => {
                  const e = hrData.EMPLOYEES.find(x => x.id === id)
                  return e ? (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div className={'av ' + e.avClass} style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 8, color: 'white' }}>{e.initials}</div>
                      {e.name.split(' ')[0]}
                    </div>
                  ) : null
                })}
              </div>
            )}

            {editingId === r.id && (
              <div style={{ padding: '12px', background: 'var(--surface)', borderTop: '1px solid var(--line-2)' }}>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', height: 30, padding: '0 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12, marginBottom: 6, boxSizing: 'border-box' }} />
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  style={{ width: '100%', height: 48, padding: '6px 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12, resize: 'none', boxSizing: 'border-box', marginBottom: 6 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn primary" style={{ height: 28, fontSize: 12 }} onClick={() => { hrToast('Бейдж обновлён', { kind: 'good' }); setEditingId(null) }}>Сохранить</button>
                  <button className="btn ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setEditingId(null)}>Отмена</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ Settings ============ */

interface HrSettingsProps { openProfile?: (id: number) => void }

export function HrSettings({ openProfile }: HrSettingsProps) {
  const [tab, setTab] = useState("profile")
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notif_dm: true, notif_group: true, notif_dl: false, notif_email: true,
    rec_auto: true, rec_consent: true,
    twofa: false,
  })
  const [sProfile, setSProfile] = useState({
    name: 'Ольга Карпова',
    email: 'hr.karpova@bank.synth',
    bio: 'HR Business Partner · Корпоративный блок',
    phone: '+7 (495) 000-00-00',
    timezone: 'Europe/Moscow',
  })
  const [sVideo, setSVideo] = useState({ quality: 'hd', storage: '180' })
  const [sMisc, setSMisc] = useState({ sandbox: '2026/Q2' })
  const [showPwForm, setShowPwForm] = useState(false)
  const [showCleanup, setShowCleanup] = useState(false)

  const LABEL: Record<string, string> = {
    notif_dm:    "Уведомления в DM",
    notif_group: "Уведомления в группах",
    notif_dl:    "Уведомления о дедлайнах",
    notif_email: "E-mail дайджесты",
    rec_auto:    "Авто-запись звонков",
    rec_consent: "Подтверждение записи",
    twofa:       "Двухфакторная авторизация",
  }

  const tog = (k: string) => {
    const nv = !toggles[k]
    setToggles(t => ({ ...t, [k]: nv }))
    hrToast(nv ? "Включено: " + LABEL[k] : "Выключено: " + LABEL[k], { kind: nv ? "good" : undefined })
  }

  const sections = [
    { id: "profile",  label: "Профиль",          icon: <Ihr.User size={15} /> },
    { id: "notif",    label: "Уведомления",       icon: <Ihr.Bell size={15} /> },
    { id: "calls",    label: "Звонки и запись",   icon: <Ihr.Video size={15} /> },
    { id: "team",     label: "Команда",           icon: <Ihr.Team size={15} /> },
    { id: "sec",      label: "Безопасность",      icon: <Ihr.Settings size={15} /> },
    { id: "billing",  label: "Песочница",         icon: <Ihr.Doc size={15} /> },
  ]

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Настройки</h1>
          <p>Mentora · HR · песочница 2026/Q2 · последнее обновление 14 мая</p>
        </div>
        <div className="right">
          <button className="btn" onClick={() => {
            const saved = localStorage.getItem('vm_hr_settings')
            if (saved) { const d = JSON.parse(saved); setSProfile(d.sProfile); setSVideo(d.sVideo); setSMisc(d.sMisc) }
            hrToast('Изменения отменены')
          }}>Отменить</button>
          <button className="btn primary" onClick={() => {
            localStorage.setItem('vm_hr_settings', JSON.stringify({ sProfile, sVideo, sMisc }))
            hrToast('Настройки сохранены', { kind: 'good', sub: 'Изменения применены' })
          }}>Сохранить</button>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-side">
          {sections.map(s => (
            <button key={s.id} className={tab === s.id ? "active" : ""} onClick={() => setTab(s.id)}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="settings-pane">
          {tab === "profile" ? (
            <>
              <h2>Профиль</h2>
              <p>Информация, которая видна команде и стажёрам</p>
              <div className="settings-field">
                <div className="lbl"><b>Имя</b><small>Отображается в шапках и встречах</small></div>
                <input
                  value={sProfile.name}
                  onChange={e => setSProfile(s => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Роль</b><small>Должность для подписи в письмах</small></div>
                <input
                  value={sProfile.bio}
                  onChange={e => setSProfile(s => ({ ...s, bio: e.target.value }))}
                />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Рабочая почта</b><small>Для уведомлений и календаря</small></div>
                <input
                  value={sProfile.email}
                  onChange={e => setSProfile(s => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Часовой пояс</b><small>Время встреч и дедлайнов</small></div>
                <select
                  value={sProfile.timezone}
                  onChange={e => setSProfile(s => ({ ...s, timezone: e.target.value }))}
                >
                  <option value="Europe/Moscow">Europe/Moscow (MSK)</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Yekaterinburg">Asia/Yekaterinburg</option>
                </select>
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Подпись</b><small>В письмах стажёрам и менторам</small></div>
                <input
                  value={sProfile.phone}
                  onChange={e => setSProfile(s => ({ ...s, phone: e.target.value }))}
                />
              </div>
            </>
          ) : tab === "notif" ? (
            <>
              <h2>Уведомления</h2>
              <p>Где и как вы будете получать оповещения от платформы</p>
              <div className="settings-field">
                <div className="lbl"><b>Личные сообщения</b><small>Бейдж в боковой панели</small></div>
                <span className={"toggle" + (toggles.notif_dm ? " on" : "")} onClick={() => tog("notif_dm")} />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Сообщения в группах</b><small>Только @упоминания и реплаи</small></div>
                <span className={"toggle" + (toggles.notif_group ? " on" : "")} onClick={() => tog("notif_group")} />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Дедлайны стажёров</b><small>Предупреждать за 24 часа</small></div>
                <span className={"toggle" + (toggles.notif_dl ? " on" : "")} onClick={() => tog("notif_dl")} />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>E-mail дайджест</b><small>Понедельник, 09:00</small></div>
                <span className={"toggle" + (toggles.notif_email ? " on" : "")} onClick={() => tog("notif_email")} />
              </div>
            </>
          ) : tab === "calls" ? (
            <>
              <h2>Звонки и запись</h2>
              <p>Параметры голосовых и видео-встреч со стажёрами</p>
              <div className="settings-field">
                <div className="lbl"><b>Авто-запись 1:1</b><small>Запись будет привязана к карточке стажёра</small></div>
                <span className={"toggle" + (toggles.rec_auto ? " on" : "")} onClick={() => tog("rec_auto")} />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Запрос согласия</b><small>Показывать дисклеймер при старте записи</small></div>
                <span className={"toggle" + (toggles.rec_consent ? " on" : "")} onClick={() => tog("rec_consent")} />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Качество видео</b><small>Влияет на размер записи</small></div>
                <select
                  value={sVideo.quality}
                  onChange={e => setSVideo(s => ({ ...s, quality: e.target.value }))}
                >
                  <option value="hd">HD · 1080p</option>
                  <option value="sd">SD · 720p</option>
                  <option value="auto">Авто</option>
                </select>
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Хранение записей</b><small>По истечении срока — авто-удаление</small></div>
                <select
                  value={sVideo.storage}
                  onChange={e => setSVideo(s => ({ ...s, storage: e.target.value }))}
                >
                  <option value="30">30 дней</option>
                  <option value="90">90 дней</option>
                  <option value="180">180 дней</option>
                  <option value="forever">Бессрочно</option>
                </select>
              </div>
            </>
          ) : tab === "team" ? (
            <>
              <h2>Команда HR</h2>
              <p>Доступ и роли для коллег</p>
              {[
                { name: "Ольга Карпова",      role: "Admin · HRBP",        you: true },
                { name: "Екатерина Соколова", role: "Mentor · Premium" },
                { name: "Антон Демидов",      role: "Mentor · Retail" },
                { name: "Илья Сорокин",       role: "Analyst (read-only)" },
              ].map((m, i) => (
                <div className="settings-field" key={i}>
                  <div className="lbl">
                    <b>{m.name}{m.you ? <span className="tag cobalt" style={{ marginLeft: 8, fontSize: 10 }}>вы</span> : null}</b>
                    <small>{m.role}</small>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn" onClick={() => {
                      const emp = hrData.EMPLOYEES[i]
                      if (emp && openProfile) openProfile(emp.id)
                      else hrToast("Открыт профиль · " + m.name)
                    }}>Профиль</button>
                    {!m.you ? <button className="btn" onClick={() => hrToast("Открыт список разрешений", { sub: m.name })}>Доступ</button> : null}
                  </div>
                </div>
              ))}
            </>
          ) : tab === "sec" ? (
            <>
              <h2>Безопасность</h2>
              <p>Защита доступа к корпоративным данным стажёров</p>
              <div className="settings-field">
                <div className="lbl"><b>Двухфакторная авторизация</b><small>Через TOTP-приложение</small></div>
                <span className={"toggle" + (toggles.twofa ? " on" : "")} onClick={() => tog("twofa")} />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Пароль</b><small>Последнее обновление: 41 день назад</small></div>
                <div>
                  <button className="btn" onClick={() => setShowPwForm(v => !v)}>Сменить пароль</button>
                  {showPwForm && (
                    <div style={{ marginTop: 10, padding: '12px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', display: 'grid', gap: 8 }}>
                      <input type="password" placeholder="Текущий пароль" style={{ height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12 }} />
                      <input type="password" placeholder="Новый пароль" style={{ height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12 }} />
                      <input type="password" placeholder="Повторите пароль" style={{ height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn primary" style={{ height: 28, fontSize: 12 }} onClick={() => { hrToast('Пароль обновлён', { kind: 'good' }); setShowPwForm(false) }}>Обновить</button>
                        <button className="btn ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setShowPwForm(false)}>Отмена</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Активные сессии</b><small>4 устройства</small></div>
                <button className="btn" onClick={() => hrToast("Выход на всех других устройствах", { kind: "good" })}>Завершить остальные</button>
              </div>
            </>
          ) : (
            <>
              <h2>Песочница</h2>
              <p>Параметры синтетической среды Mentora</p>
              <div className="settings-field">
                <div className="lbl"><b>Активная песочница</b><small>Данные изолированы от прода</small></div>
                <select
                  value={sMisc.sandbox}
                  onChange={e => setSMisc(s => ({ ...s, sandbox: e.target.value }))}
                >
                  <option value="2026/Q2">2026/Q2 · Корпоратив</option>
                  <option value="2026/Q1">2026/Q1 · Розница</option>
                  <option value="2025/Q4">2025/Q4 · Архив</option>
                </select>
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Лимит стажёров</b><small>В текущем плане</small></div>
                <input defaultValue="30 / 50" />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Очистка данных</b><small>Удаление всех записей и заметок</small></div>
                <div>
                  <button
                    className="btn"
                    style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}
                    onClick={() => setShowCleanup(v => !v)}
                  >
                    Запросить очистку
                  </button>
                  {showCleanup && (
                    <div style={{ marginTop: 10, padding: '14px', background: 'var(--cobalt-tint)', border: '1px solid var(--cobalt-tint-2)', borderRadius: 'var(--r-sm)' }}>
                      <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--ink)' }}>Вы уверены? Это действие нельзя отменить. Все сценарии и история будут удалены.</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" style={{ height: 28, fontSize: 12, background: 'var(--bad)', color: 'white', borderColor: 'var(--bad)' }}
                          onClick={() => { hrToast('Данные удалены', { kind: 'warn' }); setShowCleanup(false) }}>Да, очистить</button>
                        <button className="btn ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setShowCleanup(false)}>Отмена</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
