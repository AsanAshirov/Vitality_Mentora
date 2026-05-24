// HrPerformance.tsx — analytics screen
import { useState, useRef, useEffect, Fragment } from 'react'
import hrData from '../hrData'
import { hrToast, MenuPopover } from '../hrToast'
import { Ihr } from '../iconsHr'
import Sparkline from '../shell/Sparkline'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HrPerformanceProps {
  openProfile: (id: number) => void
}

// ---------------------------------------------------------------------------
// Module-level helper
// ---------------------------------------------------------------------------

function cellLevel(v: number): string {
  if (v >= 90) return "l4"
  if (v >= 80) return "l3"
  if (v >= 70) return "l2"
  if (v >= 60) return "lo"
  return "bad"
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: filename,
  })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
}

// ---------------------------------------------------------------------------
// AreaChart — module-internal component
// ---------------------------------------------------------------------------

interface AreaChartProps {
  weeks: string[]
  avg: number[]
  target: number[]
}

function AreaChart({ weeks, avg, target }: AreaChartProps) {
  const w = 920, h = 220, padL = 36, padR = 16, padT = 12, padB = 28
  const ymin = 50, ymax = 90

  const lineRef = useRef<SVGPathElement>(null)
  const [dash, setDash] = useState<number | null>(null)

  useEffect(() => {
    if (lineRef.current) {
      setDash(lineRef.current.getTotalLength())
    }
  }, [avg])
  const xs = weeks.length
  const xx = (i: number) => padL + (i / (xs - 1)) * (w - padL - padR)
  const yy = (v: number) => padT + (1 - (v - ymin) / (ymax - ymin)) * (h - padT - padB)

  const areaPath = avg.map((v, i) => `${i === 0 ? 'M' : 'L'}${xx(i)},${yy(v)}`).join(' ')
    + ` L${xx(xs - 1)},${h - padB} L${xx(0)},${h - padB} Z`

  return (
    <svg className="area-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(32,70,255,0.22)" />
          <stop offset="100%" stopColor="rgba(32,70,255,0)" />
        </linearGradient>
      </defs>
      {/* grid */}
      {[50, 60, 70, 80, 90].map(g => (
        <g key={g}>
          <line
            x1={padL} y1={yy(g)} x2={w - padR} y2={yy(g)}
            stroke="var(--line)"
            strokeDasharray={g === 50 ? undefined : "3 4"}
          />
          <text
            x={padL - 6} y={yy(g) + 3}
            fontSize="10"
            fill="var(--mute)"
            textAnchor="end"
            fontFamily="var(--font-mono)"
          >
            {g}
          </text>
        </g>
      ))}
      {weeks.map((wk, i) => (
        <text
          key={wk}
          x={xx(i)} y={h - 8}
          fontSize="10"
          fill="var(--mute)"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
        >
          {wk}
        </text>
      ))}
      <path d={areaPath} fill="url(#areaG)"
            style={{ opacity: 0, animation: 'fade-in 0.5s 0.4s cubic-bezier(0.2,0.8,0.2,1) forwards' }} />
      <path
        d={target.map((v, i) => `${i === 0 ? 'M' : 'L'}${xx(i)},${yy(v)}`).join(' ')}
        fill="none"
        stroke="var(--mute-3)"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      <path
        ref={lineRef}
        d={avg.map((v, i) => `${i === 0 ? 'M' : 'L'}${xx(i)},${yy(v)}`).join(' ')}
        fill="none"
        stroke="var(--cobalt)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={dash != null ? {
          strokeDasharray: dash,
          strokeDashoffset: dash,
          animation: 'chart-draw 0.9s cubic-bezier(0.4,0,0.2,1) forwards',
        } : undefined}
      />
      {avg.map((v, i) => (
        <circle
          key={i}
          cx={xx(i)} cy={yy(v)}
          r="3.5"
          fill="white"
          stroke="var(--cobalt)"
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// HrPerformance
// ---------------------------------------------------------------------------

export default function HrPerformance({ openProfile }: HrPerformanceProps) {
  const top5 = hrData.EMPLOYEES.slice().sort((a, b) => b.score - a.score).slice(0, 5)
  const bottom4 = hrData.EMPLOYEES.slice().sort((a, b) => a.score - b.score).slice(0, 4)
  const [period, setPeriod] = useState("12 недель")
  const [cohort, setCohort] = useState("Все когорты")

  const periodRef = useRef<HTMLButtonElement>(null)
  const cohortRef = useRef<HTMLButtonElement>(null)
  const [periodOpen, setPeriodOpen] = useState(false)
  const [cohortOpen, setCohortOpen] = useState(false)
  const [selectedKpi, setSelectedKpi] = useState<number | null>(null)

  // 12 week trend area chart
  const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`)
  const cohortSeries = {
    avg:    [62, 64, 65, 67, 68, 70, 71, 72, 74, 76, 78, 79],
    target: [65, 66, 68, 70, 72, 73, 75, 76, 78, 80, 82, 84],
  }

  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Performance</h1>
          <p>Аналитика по 26 стажёрам · период: 12 недель · обновлено 2 мин назад</p>
        </div>
        <div className="right">
          <button ref={periodRef} className="btn" onClick={() => setPeriodOpen(o => !o)}>
            Период: {period} <Ihr.ChevronD size={12} />
          </button>
          <button ref={cohortRef} className="btn" onClick={() => setCohortOpen(o => !o)}>
            {cohort} <Ihr.ChevronD size={12} />
          </button>
          <button
            className="btn primary"
            onClick={() => downloadCsv('performance-report.csv', [
              ['Команда', ...hrData.MODULES],
              ...Object.entries(hrData.HEATMAP).map(([team, scores]) => [team, ...scores.map(String)])
            ])}
          >
            <Ihr.Download size={14} /> Отчёт
          </button>
          <MenuPopover
            open={periodOpen}
            anchorRef={periodRef}
            onClose={() => setPeriodOpen(false)}
            items={[
              { title: "Период анализа" },
              { label: "7 дней",    active: period === "7 дней",    onClick: () => { setPeriod("7 дней");    hrToast("Период: 7 дней") } },
              { label: "4 недели",  active: period === "4 недели",  onClick: () => { setPeriod("4 недели");  hrToast("Период: 4 недели") } },
              { label: "12 недель", active: period === "12 недель", onClick: () => { setPeriod("12 недель"); hrToast("Период: 12 недель") } },
              { label: "Полугодие", active: period === "Полугодие", onClick: () => { setPeriod("Полугодие"); hrToast("Период: полугодие") } },
            ]}
          />
          <MenuPopover
            open={cohortOpen}
            anchorRef={cohortRef}
            onClose={() => setCohortOpen(false)}
            items={[
              { title: "Когорта" },
              { label: "Все когорты", active: cohort === "Все когорты", onClick: () => { setCohort("Все когорты"); hrToast("Все когорты") } },
              { label: "Розница",     active: cohort === "Розница",     onClick: () => { setCohort("Розница");     hrToast("Когорта: Розница · 8 стажёров") } },
              { label: "Корпоратив",  active: cohort === "Корпоратив",  onClick: () => { setCohort("Корпоратив");  hrToast("Когорта: Корпоратив · 7 стажёров") } },
              { label: "Премиум",     active: cohort === "Премиум",     onClick: () => { setCohort("Премиум");     hrToast("Когорта: Премиум · 5 стажёров") } },
            ]}
          />
        </div>
      </div>

      <div className="perf-grid">
        {hrData.PERF_KPIS.map((k, i) => (
          <div
            className={"perf-tile" + (selectedKpi === i ? " active" : "")}
            key={i}
            onClick={() => setSelectedKpi(selectedKpi === i ? null : i)}
            style={{ cursor: 'pointer', outline: selectedKpi === i ? '2px solid var(--cobalt)' : undefined, outlineOffset: -2 }}
          >
            <span className="lbl">{k.lbl}</span>
            <div className="val">{k.val}<small>{k.suffix}</small></div>
            <div className={"delta " + (k.dir === "down" ? "down" : "")}>
              {k.dir === "up" ? <Ihr.ArrowUp size={10} /> : <Ihr.ArrowDn size={10} />} {k.delta}
            </div>
            <div className="mini-spark">
              <Sparkline data={k.spark} tone={k.dir === "up" ? "good" : "bad"} />
            </div>
          </div>
        ))}
      </div>

      {selectedKpi !== null && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-lg)', padding: '20px 24px', marginBottom: 16,
          animation: 'page-enter 0.22s var(--ease-out) both',
        }}>
          {selectedKpi === 0 && (
            <>
              <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>Средний балл · разбивка по когортам</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { name: "Розница", avg: 76.9, count: 8, delta: "+2.1" },
                  { name: "Корпоратив", avg: 81.3, count: 7, delta: "+4.5" },
                  { name: "Премиум", avg: 74.6, count: 5, delta: "+1.8" },
                ].map(c => (
                  <div key={c.name} style={{ padding: '14px 16px', background: 'var(--paper)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--mute)', marginBottom: 4 }}>{c.name} · {c.count} стажёров</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{c.avg}<small style={{ fontSize: 13 }}>%</small></div>
                    <div style={{ fontSize: 12, color: 'var(--good)', marginTop: 2 }}>↑ {c.delta} за неделю</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--mute)' }}>
                Топ: Виктория Иванова 95 · Никита Соловьёв 92 · Мария Сухова 91 &nbsp;|&nbsp; Требуют внимания: Олег Прохоров 55 · Кирилл Беляков 58
              </div>
            </>
          )}
          {selectedKpi === 1 && (
            <>
              <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>Активность · 24 из 26 стажёров</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {hrData.EMPLOYEES.sort((a, b) => b.score - a.score).map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--paper)', borderRadius: 8 }}
                       onClick={() => openProfile(e.id)}>
                    <div className={"av " + e.avClass} style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 10, color: 'white', flexShrink: 0 }}>{e.initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--mute)' }}>{e.lastActive}</div>
                    </div>
                    <span className={"st " + e.status} style={{ fontSize: 10 }}>{e.status === "online" ? "В сети" : e.status === "busy" ? "Занят" : e.status === "away" ? "Отошёл" : "Не в сети"}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {selectedKpi === 2 && (
            <>
              <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>Завершено сценариев · 312 за неделю</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { name: "Розница", count: 124, delta: "+18" },
                  { name: "Корпоратив", count: 108, delta: "+21" },
                  { name: "Премиум", count: 80, delta: "+8" },
                ].map(c => (
                  <div key={c.name} style={{ padding: '14px 16px', background: 'var(--paper)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--mute)', marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{c.count}</div>
                    <div style={{ fontSize: 12, color: 'var(--good)', marginTop: 2 }}>↑ {c.delta} к прошлой неделе</div>
                  </div>
                ))}
              </div>
              {[
                { lbl: "KYC · Онбординг", n: 87, pct: 92 },
                { lbl: "Антифрод · Базовый", n: 64, pct: 78 },
                { lbl: "Продукты · Карты", n: 58, pct: 71 },
                { lbl: "SWIFT · Переводы", n: 52, pct: 63 },
                { lbl: "Депозиты · Досрочное", n: 51, pct: 61 },
              ].map(s => (
                <div key={s.lbl} className="dist-row" style={{ marginBottom: 6 }}>
                  <span className="lbl" style={{ minWidth: 160 }}>{s.lbl}</span>
                  <span className="bar"><i className="cobalt" style={{ width: s.pct + '%' }} /></span>
                  <span className="num">{s.n}</span>
                </div>
              ))}
            </>
          )}
          {selectedKpi === 3 && (
            <>
              <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>Зона риска · 4 стажёра требуют поддержки</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {hrData.EMPLOYEES.filter(e => e.score < 65 || e.delta < -3).slice(0, 4).map(e => (
                  <div key={e.id}
                    onClick={() => openProfile(e.id)}
                    style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--paper)', borderRadius: 10, cursor: 'pointer' }}
                  >
                    <div className={"av " + e.avClass} style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 500, fontSize: 13 }}>{e.initials}</div>
                    <div>
                      <b style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{e.name}</b>
                      <small style={{ fontSize: 11.5, color: 'var(--mute)' }}>{e.score < 65 ? "Балл ниже порога" : "Сильное снижение"} · δ{e.delta}</small>
                    </div>
                    <span className={"score-x " + (e.score < 65 ? "bad" : "warn")}>{e.score}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,107,0,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--warn)' }}>
                Рекомендация: назначить 1:1 в течение 48 часов и предложить дополнительные материалы по слабым модулям.
              </div>
            </>
          )}
        </div>
      )}

      <div className="area-chart-card">
        <div className="ch">
          <h3>Динамика среднего балла · все когорты</h3>
          <div className="legend">
            <span><i className="l-cobalt" />Средний балл</span>
            <span><i className="l-mute" />План</span>
          </div>
        </div>
        <AreaChart weeks={weeks} avg={cohortSeries.avg} target={cohortSeries.target} />
      </div>

      <div className="perf-row">
        <div className="heatmap">
          <h3>Тепловая карта · команды × модули</h3>
          <div className="sub-x">Показан медианный балл, в баллах из 100</div>
          <div className="heatmap-grid">
            <span className="hd first">Команда / модуль</span>
            {hrData.MODULES.map(m => (
              <span className="hd" key={m}>{m.length > 18 ? m.slice(0, 16) + "…" : m}</span>
            ))}
            {Object.entries(hrData.HEATMAP).map(([team, vals]) => (
              <Fragment key={team}>
                <span className="rowlbl">{team}</span>
                {vals.map((v, i) => (
                  <span
                    className={"cell " + cellLevel(v)}
                    key={i}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const emp = hrData.EMPLOYEES.find(e => e.team === team)
                      if (emp) openProfile(emp.id)
                    }}
                  >
                    {v}
                  </span>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="podium-card">
          <h3>Топ-5 стажёров недели</h3>
          {top5.map((e, i) => (
            <div className="pod-row" key={e.id} style={{ cursor: 'pointer', animationDelay: `${i * 50}ms` }} onClick={() => openProfile(e.id)}>
              <span className={"pod-rank " + (i === 0 ? "top" : "")}>#{i + 1}</span>
              <div className={"av " + e.avClass}>{e.initials}</div>
              <div className="nm">
                <b>{e.name}</b>
                <small>{e.team}</small>
              </div>
              <span className="scr">{e.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="perf-row">
        <div className="heatmap">
          <h3>Зона риска · нужна поддержка</h3>
          <div className="sub-x">4 стажёра с баллом ниже 70 или отрицательным трендом</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
            {bottom4.map((e, i) => (
              <div
                key={e.id}
                onClick={() => openProfile(e.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--paper)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div
                  className={"av " + e.avClass}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  {e.initials}
                </div>
                <div>
                  <b style={{ display: 'block', fontSize: 13, fontWeight: 500 }}>{e.name}</b>
                  <small style={{ fontSize: 11.5, color: 'var(--mute)' }}>
                    {e.score < 65 ? "Балл ниже порога" : "Снижение балла"} · {e.delta} за неделю
                  </small>
                </div>
                <span className={"score-x " + (e.score < 65 ? "bad" : "warn")}>{e.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="podium-card">
          <h3>Динамика по навыкам</h3>
          {[
            { lbl: "Продукты · карты",  pct: 86, d: "+4" },
            { lbl: "Эмпатия в звонке",  pct: 81, d: "+7", best: true },
            { lbl: "Антифрод",          pct: 74, d: "+1" },
            { lbl: "Эскалация",         pct: 68, d: "−2", worst: true },
            { lbl: "Регламенты",        pct: 77, d: "+3" },
          ].map((s, i) => (
            <div className="skill-row" key={i} style={{ margin: '9px 0' }}>
              <span className="lbl" style={{ fontSize: 12.5 }}>
                {s.lbl}
                {s.best  ? <span className="tag good" style={{ marginLeft: 6, padding: '1px 5px', fontSize: 10 }}>↑ лидер</span>        : null}
                {s.worst ? <span className="tag warn" style={{ marginLeft: 6, padding: '1px 5px', fontSize: 10 }}>требует фокуса</span>  : null}
              </span>
              <span className="bar">
                <i className={s.best ? "good" : s.worst ? "warn" : ""} style={{ width: s.pct + "%" }} />
              </span>
              <span className="pct" style={{ color: s.d.startsWith("+") ? 'var(--good)' : 'var(--bad)' }}>{s.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
