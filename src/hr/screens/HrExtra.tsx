// HrExtra.tsx — Calendar, Requests, Rewards, Settings (ported from reference/screens/extra.jsx)
import { useState, useRef, Fragment } from 'react'
import hrData from '../hrData'
import { hrToast } from '../hrToast'
import { Ihr } from '../iconsHr'
import Avatar from '../shell/Avatar'
import type { RequestItem } from '../hrTypes'

/* ============ Calendar ============ */

export function HrCalendar({
  openCall,
  openProfile,
}: {
  openCall?: (id: number | string, mode: string) => void
  openProfile?: (id: number) => void
}) {
  const [week, setWeek] = useState(0)
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
          <button className="btn primary" onClick={() => hrToast("Открыто окно создания встречи", { sub: "Choose attendees & time" })}>
            <Ihr.Plus size={14} /> Новая встреча
          </button>
        </div>
      </div>

      <div className="cal-head">
        <div className="nav">
          <button className="icon-btn" onClick={() => { setWeek(w => w - 1); hrToast("Неделя 7 · 16–22 мая") }}><Ihr.ArrowL size={14} /></button>
          <b>23 — 27 мая 2026</b>
          <button className="icon-btn" onClick={() => { setWeek(w => w + 1); hrToast("Неделя 9 · 30 мая – 5 июня") }}><Ihr.Arrow size={14} /></button>
          <button className="btn ghost" style={{ height: 28, fontSize: 12, marginLeft: 8 }} onClick={() => { setWeek(0); hrToast("К текущей неделе", { kind: "good" }) }}>Сегодня</button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn" style={{ height: 28, fontSize: 12 }} onClick={() => hrToast("Просмотр: неделя")}>Неделя</button>
          <button className="btn ghost" style={{ height: 28, fontSize: 12 }} onClick={() => hrToast("Просмотр: месяц")}>Месяц</button>
          <button className="btn ghost" style={{ height: 28, fontSize: 12 }} onClick={() => hrToast("Просмотр: день")}>День</button>
        </div>
      </div>

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
                        onClick={() => hrToast(e.title, { sub: e.sub + " · " + formatTime(e.start) + "–" + formatTime(e.end) })}
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
  function comment(id: string) {
    const r = items.find(x => x.id === id)!
    const e = hrData.EMPLOYEES.find(x => x.id === r.who)!
    hrToast("Открыт диалог с " + e.name.split(' ')[0], { sub: "Можно запросить уточнение" })
  }

  const filtered = tab === "all" ? items : items.filter(r => r.status === tab)
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
          <button className="btn" onClick={() => hrToast("CSV экспорт · 6 заявок", { kind: "good" })}><Ihr.Download size={14} /> Экспорт</button>
        </div>
      </div>

      <div className="emp-filter-pills" style={{ marginBottom: 14 }}>
        <button className={"emp-pill" + (tab === "pending" ? " active" : "")} onClick={() => setTab("pending")}>Новые<span className="count">{counts.pending}</span></button>
        <button className={"emp-pill" + (tab === "review" ? " active" : "")} onClick={() => setTab("review")}>На рассмотрении<span className="count">{counts.review}</span></button>
        <button className={"emp-pill" + (tab === "approved" ? " active" : "")} onClick={() => setTab("approved")}>Одобрено<span className="count">{counts.approved}</span></button>
        <button className={"emp-pill" + (tab === "all" ? " active" : "")} onClick={() => setTab("all")}>Все<span className="count">{counts.all}</span></button>
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
            <div className="req-row" key={r.id} onClick={() => hrToast(r.kind, { sub: r.note })}>
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
                  <button onClick={() => comment(r.id)}>Уточнить</button>
                  <button className="primary" onClick={() => approve(r.id)}>Одобрить</button>
                </> : <button onClick={() => hrToast("Решение зафиксировано в журнале", { kind: "good" })}>В журнал</button>}
              </div>
            </div>
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
  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>Награды</h1>
          <p>6 активных бейджей · 18 наград выдано в этом месяце · XP-фонд: 12 400 / 20 000</p>
        </div>
        <div className="right">
          <button className="btn" onClick={() => hrToast("История наград за 90 дней", { sub: "Excel · 142 строки" })}><Ihr.Download size={14} /> История</button>
          <button className="btn primary" onClick={() => hrToast("Открыт конструктор бейджа", { sub: "Настройте условия и XP-награду" })}><Ihr.Plus size={14} /> Создать бейдж</button>
        </div>
      </div>

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
              <button onClick={() => hrToast("Открыт список получателей", { sub: r.name })}>
                <Ihr.Team size={12} style={{ marginRight: 4, verticalAlign: -1 }} /> Получатели
              </button>
              <button onClick={() => hrToast("Открыт конструктор · " + r.name)}>
                Настроить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ Settings ============ */

export function HrSettings() {
  const [tab, setTab] = useState("profile")
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notif_dm: true, notif_group: true, notif_dl: false, notif_email: true,
    rec_auto: true, rec_consent: true,
    twofa: false,
  })

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
          <button className="btn" onClick={() => hrToast("Изменения отменены")}>Отменить</button>
          <button className="btn primary" onClick={() => hrToast("Настройки сохранены", { kind: "good" })}>Сохранить</button>
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
                <input defaultValue="Ольга Карпова" onChange={() => {}} />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Роль</b><small>Должность для подписи в письмах</small></div>
                <input defaultValue="HR Business Partner · Корпоративный блок" />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Рабочая почта</b><small>Для уведомлений и календаря</small></div>
                <input defaultValue="hr.karpova@bank.synth" />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Часовой пояс</b><small>Время встреч и дедлайнов</small></div>
                <select defaultValue="MSK">
                  <option value="MSK">Europe/Moscow (MSK)</option>
                  <option value="UTC">UTC</option>
                  <option value="YEK">Asia/Yekaterinburg</option>
                </select>
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Подпись</b><small>В письмах стажёрам и менторам</small></div>
                <input defaultValue="С уважением, Ольга · HRBP Mentora" />
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
                <select defaultValue="hd">
                  <option value="hd">HD · 1080p</option>
                  <option value="sd">SD · 720p</option>
                  <option value="auto">Авто</option>
                </select>
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Хранение записей</b><small>По истечении срока — авто-удаление</small></div>
                <select defaultValue="180">
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
                    <button className="btn" onClick={() => hrToast("Открыт профиль · " + m.name)}>Профиль</button>
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
                <button className="btn" onClick={() => hrToast("Открыт диалог смены пароля")}>Сменить пароль</button>
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
                <select defaultValue="2026q2">
                  <option value="2026q2">2026/Q2 · Корпоратив</option>
                  <option value="2026q1">2026/Q1 · Розница</option>
                  <option value="2025q4">2025/Q4 · Архив</option>
                </select>
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Лимит стажёров</b><small>В текущем плане</small></div>
                <input defaultValue="30 / 50" />
              </div>
              <div className="settings-field">
                <div className="lbl"><b>Очистка данных</b><small>Удаление всех записей и заметок</small></div>
                <button
                  className="btn"
                  style={{ color: 'var(--bad)', borderColor: 'var(--bad)' }}
                  onClick={() => hrToast("Запрос отправлен · требуется подтверждение по почте", { kind: "warn" })}
                >
                  Запросить очистку
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
