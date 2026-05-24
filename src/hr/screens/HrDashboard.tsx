// HrDashboard.tsx — HR home overview

import React, { useState } from 'react'
import hrData from '../hrData'
import { hrToast } from '../hrToast'
import { Ihr } from '../iconsHr'

// ---------------------------------------------------------------------------
// downloadCsv helper
// ---------------------------------------------------------------------------

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: filename,
  })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HrDashboardProps {
  setRoute: (r: string) => void
  openProfile: (id: number) => void
  openChat: (id: number) => void
}

// ---------------------------------------------------------------------------
// ChartSvg — module-internal, not exported
// ---------------------------------------------------------------------------

interface ChartSvgProps {
  weeks: string[]
  series: Record<string, number[]>
}

function ChartSvg({ weeks, series }: ChartSvgProps) {
  const w = 580, h = 200, padL = 28, padR = 8, padT = 14, padB = 26
  const ymin = 40, ymax = 100
  const xs = weeks.length
  const xx = (i: number) => padL + (i / (xs - 1)) * (w - padL - padR)
  const yy = (v: number) => padT + (1 - (v - ymin) / (ymax - ymin)) * (h - padT - padB)
  const seriesEntries = Object.entries(series)
  const colors: Record<string, string> = {
    "Корпоратив": "var(--cobalt)",
    "Розница":    "var(--good)",
    "Премиум":    "var(--mute-3)",
  }

  return (
    <svg className="chart-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {/* grid */}
      {[40, 55, 70, 85, 100].map(g => (
        <g key={g}>
          <line
            x1={padL} y1={yy(g)} x2={w - padR} y2={yy(g)}
            stroke="var(--line)" strokeWidth="1"
            strokeDasharray={g === 40 ? undefined : "3 4"}
          />
          <text
            x={padL - 6} y={yy(g) + 3}
            fontSize="9.5" fill="var(--mute)"
            textAnchor="end" fontFamily="var(--font-mono)"
          >
            {g}
          </text>
        </g>
      ))}
      {/* x labels */}
      {weeks.map((wk, i) => (
        <text
          key={wk} x={xx(i)} y={h - 8}
          fontSize="10" fill="var(--mute)"
          textAnchor="middle" fontFamily="var(--font-mono)"
        >
          {wk}
        </text>
      ))}
      {/* lines */}
      {seriesEntries.map(([name, arr]) => (
        <g key={name}>
          <path
            d={arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${xx(i)},${yy(v)}`).join(' ')}
            fill="none" stroke={colors[name]} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
          {arr.map((v, i) => (
            <circle key={i} cx={xx(i)} cy={yy(v)} r="3" fill={colors[name]} />
          ))}
        </g>
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// HrDashboard
// ---------------------------------------------------------------------------

export default function HrDashboard({ setRoute, openProfile, openChat }: HrDashboardProps) {
  const [showAddIntern, setShowAddIntern] = useState(false)

  const top = hrData.EMPLOYEES.slice().sort((a, b) => a.score - b.score).slice(0, 4)

  // chart data: weekly cohort progress
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]
  const series: Record<string, number[]> = {
    "Розница":    [55, 60, 65, 68, 72, 74, 77, 80],
    "Корпоратив": [62, 65, 69, 72, 76, 80, 84, 86],
    "Премиум":    [48, 52, 58, 62, 67, 70, 73, 75],
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Добрый день, Ольга</h1>
          <p>26 стажёров · 3 когорты · неделя 8 из 12 · понедельник, 23 мая</p>
        </div>
        <div className="right">
          <button
            className="btn"
            onClick={() => downloadCsv('hr-report.csv', [
              ['Сотрудник','Действие','Цель','Результат','Время'],
              ...hrData.FEED.map(f => {
                const e = hrData.EMPLOYEES.find(x => x.id === f.who)
                return [e?.name ?? '', f.action, f.target, f.tag, f.when]
              })
            ])}
          >
            <Ihr.Download size={14} /> Экспорт отчёта
          </button>
          <button
            className="btn primary"
            onClick={() => setShowAddIntern(v => !v)}
          >
            <Ihr.Plus size={14} /> Добавить стажёра
          </button>
        </div>
      </div>

      <div className={'inline-panel' + (showAddIntern ? ' open' : '')} style={{marginBottom: showAddIntern ? 16 : 0}}>
        <div style={{background:'var(--surface)', border:'1px solid var(--line-2)', borderRadius:'var(--r-lg)', padding:'18px 20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:10, alignItems:'end'}}>
          <div>
            <label style={{fontSize:11,color:'var(--mute)',display:'block',marginBottom:4}}>Имя</label>
            <input style={{width:'100%',height:34,padding:'0 10px',border:'1px solid var(--line-2)',borderRadius:'var(--r-sm)',background:'var(--paper)',fontSize:13}} placeholder="Фамилия Имя"/>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--mute)',display:'block',marginBottom:4}}>Роль</label>
            <input style={{width:'100%',height:34,padding:'0 10px',border:'1px solid var(--line-2)',borderRadius:'var(--r-sm)',background:'var(--paper)',fontSize:13}} placeholder="Стажёр · Розница"/>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--mute)',display:'block',marginBottom:4}}>Команда</label>
            <select style={{width:'100%',height:34,padding:'0 10px',border:'1px solid var(--line-2)',borderRadius:'var(--r-sm)',background:'var(--paper)',fontSize:13}}>
              {hrData.COHORTS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn primary" style={{height:34}} onClick={() => { hrToast('Стажёр добавлен', {kind:'good',sub:'Приглашение отправлено на email'}); setShowAddIntern(false) }}>Добавить</button>
            <button className="btn ghost" style={{height:34}} onClick={() => setShowAddIntern(false)}>Отмена</button>
          </div>
        </div>
      </div>

      <div className="hr-hero">
        <div className="hr-headline">
          <div className="eyebrow">Обзор недели</div>
          <h2>Когорта <em>Корпоратив</em> закрывает модуль «Антифрод» с опережением — но <em>4 стажёра</em> в зоне риска.</h2>
          <div className="h-row">
            <div className="h-stat" style={{ cursor: 'pointer' }} onClick={() => setRoute('performance')}><b>79.4<small>%</small></b><span>Средний балл</span></div>
            <div className="h-stat" style={{ cursor: 'pointer' }} onClick={() => setRoute('performance')}><b>312</b><span>Сценариев / нед</span></div>
            <div className="h-stat" style={{ cursor: 'pointer' }} onClick={() => setRoute('performance')}><b>+3.2<small>%</small></b><span>WoW рост</span></div>
            <div className="h-stat" style={{ cursor: 'pointer' }} onClick={() => setRoute('performance')}><b>92<small>%</small></b><span>Активность</span></div>
          </div>
        </div>

        <div className="attention">
          <div className="att-head">
            <h3>Требуют внимания</h3>
            <span className="pill">4 человека</span>
          </div>
          {top.map(e => (
            <div className="att-row" key={e.id} onClick={() => openProfile(e.id)} style={{ cursor: 'pointer' }}>
              <div className={"av " + e.avClass}>{e.initials}</div>
              <div>
                <b>{e.name}</b>
                <div className="reason">
                  {e.score < 65 ? "Балл ниже порога · " : "Снижение балла · "}
                  {e.delta < 0 ? `${e.delta} за неделю` : "стагнация"}
                </div>
              </div>
              <span className={"score-x " + (e.score < 65 ? "bad" : "warn")}>{e.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cohort-card">
        <div className="cohort-chart">
          <div className="cohort-chart-head">
            <h3>Прогресс когорт</h3>
            <div className="legend">
              <span><i className="l-cobalt" />Корпоратив</span>
              <span><i className="l-good" />Розница</span>
              <span><i className="l-mute" />Премиум</span>
            </div>
          </div>
          <ChartSvg weeks={weeks} series={series} />
        </div>
        <div className="distribution">
          <h3>Распределение баллов</h3>
          {[
            { lbl: "90 — 100", n: 4, kind: "good",   pct: 18 },
            { lbl: "80 — 89",  n: 8, kind: "cobalt", pct: 35 },
            { lbl: "70 — 79",  n: 7, kind: "cobalt", pct: 30 },
            { lbl: "60 — 69",  n: 3, kind: "warn",   pct: 13 },
            { lbl: "< 60",     n: 1, kind: "bad",    pct: 4  },
          ].map((r, i) => (
            <div className="dist-row" key={r.lbl}>
              <span className="lbl">{r.lbl}</span>
              <span className="bar"><i className={r.kind} style={{ '--bar-w': (r.pct * 2.4) + '%', animationDelay: `${i * 80}ms` } as React.CSSProperties} /></span>
              <span className="num">{r.n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hr-two">
        <div className="feed-card">
          <div className="ch">
            <h3>Активность сегодня</h3>
            <a onClick={() => setRoute('employees')}>
              Все события →
            </a>
          </div>
          {hrData.FEED.slice(0, 6).map((f, idx) => {
            const e = hrData.EMPLOYEES.find(x => x.id === f.who)!
            return (
              <div
                className="feed-row"
                key={f.id}
                style={{ cursor: 'pointer', animationDelay: `${idx * 40}ms` }}
                onClick={() => openProfile(f.who)}
              >
                <div className={"av " + e.avClass}>{e.initials}</div>
                <div className="body">
                  <b>{e.name.split(' ')[0]}</b>{' '}
                  <span className="muted">{f.action}</span>{' '}
                  <b>{f.target}</b>
                  {f.tag ? <span className={"tag " + (f.tagKind || "")}>{f.tag}</span> : null}
                </div>
                <span className="when">{f.when}</span>
              </div>
            )
          })}
        </div>

        <div className="schedule-card">
          <div className="ch">
            <h3>Расписание · сегодня</h3>
            <a onClick={() => setRoute("calendar")}>Календарь →</a>
          </div>
          {hrData.SCHEDULE.map(s => (
            <div
              className="sch-row"
              key={s.id}
              style={{ cursor: 'pointer' }}
              onClick={() => setRoute('calendar')}
            >
              <div className="sch-time">{s.time}<small>{s.end}</small></div>
              <div className="sch-body">
                <b>{s.title}</b>
                <span>{s.context}</span>
              </div>
              <div className="sch-with">
                {s.with.slice(0, 3).map(id => {
                  const e = hrData.EMPLOYEES.find(x => x.id === id)!
                  return <div className={"av " + e.avClass} key={id}>{e.initials}</div>
                })}
                {s.with.length > 3
                  ? <div className="av" style={{ background: 'var(--surface-2)', color: 'var(--mute)' }}>+{s.with.length - 3}</div>
                  : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
