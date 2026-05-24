import { useState, useRef, Fragment } from 'react'
import React from 'react'
import { Ihr } from '../iconsHr'
import { hrToast, NotificationsPopover, UserMenuPopover } from '../hrToast'
import hrData from '../hrData'

interface HrTopbarProps {
  crumbs: string[]
  onOpenProfile?: (id: number | null) => void
  onOpenSettings?: () => void
}

export default function HrTopbar({ crumbs, onOpenProfile, onOpenSettings }: HrTopbarProps) {
  const bellRef = useRef<HTMLButtonElement>(null)
  const userRef = useRef<HTMLButtonElement>(null)
  const [bellOpen, setBellOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [q, setQ] = useState("")
  const [notifSeen, setNotifSeen] = useState(false)

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && q.trim()) {
      hrToast("Поиск: «" + q + "»", { sub: "Найдено 3 совпадения в стажёрах и сценариях" })
      setQ("")
    }
  }

  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <Fragment key={i}>
            {i > 0 ? <Ihr.ChevronR size={12} /> : null}
            <span>
              {i === crumbs.length - 1 ? <em>{c}</em> : c}
            </span>
          </Fragment>
        ))}
      </div>

      <div className="topsearch">
        <Ihr.Search size={14} />
        <input
          placeholder="Поиск по сотрудникам, сценариям, модулям…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onSearchKey}
        />
        <kbd>⌘K</kbd>
      </div>

      <div className="top-right">
        <button className="top-icon" title="Уведомления" ref={bellRef} onClick={() => { setBellOpen(o => !o); setNotifSeen(true) }}>
          <Ihr.Bell size={16} />
          {!notifSeen && <span className="dot" />}
        </button>
        <button
          className="top-icon"
          title="Меню"
          onClick={() => hrToast("Быстрые действия", { sub: "Создать стажёра · Импорт CSV · Назначить ментора" })}
        >
          <Ihr.More size={16} />
        </button>
        <button
          ref={userRef}
          className={"av " + hrData.HR_USER.avClass}
          onClick={() => setUserOpen(o => !o)}
          style={{
            width: 30, height: 30, borderRadius: "50%",
            display: "grid", placeItems: "center",
            fontSize: 11, fontWeight: 500, color: "white",
            border: 0, cursor: "pointer"
          }}
        >{hrData.HR_USER.initials}</button>

        <NotificationsPopover
          open={bellOpen}
          anchorRef={bellRef}
          onClose={() => setBellOpen(false)}
          onOpenProfile={onOpenProfile}
        />
        <UserMenuPopover
          open={userOpen}
          anchorRef={userRef}
          onClose={() => setUserOpen(false)}
          onAction={(a) => { if (a === "settings") onOpenSettings?.() }}
        />
      </div>
    </div>
  )
}
