// hrToast.tsx — HR portal toast notifications + popover host
import React, { useState, useEffect, useRef } from 'react'
import hrData from './hrData'
import { Ihr } from './iconsHr'
import { useSettingsStore } from '../store/settingsStore'

// ---------------------------------------------------------------------------
// Toast singleton
// ---------------------------------------------------------------------------

export type ToastOpts = { kind?: 'info' | 'good' | 'bad' | 'warn'; sub?: string; dwell?: number }

let _dispatch: ((msg: string, opts?: ToastOpts) => void) | null = null

export function hrToast(msg: string, opts?: ToastOpts): void {
  _dispatch?.(msg, opts)
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface ToastItem {
  id: string
  msg: string
  sub: string | null
  kind: 'info' | 'good' | 'bad' | 'warn'
  leaving: boolean
}

// ---------------------------------------------------------------------------
// HrToastHost
// ---------------------------------------------------------------------------

export function HrToastHost() {
  const [list, setList] = useState<ToastItem[]>([])

  useEffect(() => {
    _dispatch = (msg: string, opts: ToastOpts = {}) => {
      const id = Math.random().toString(36).slice(2)
      const kind = opts.kind || 'info'
      const sub = opts.sub || null
      setList(l => [...l, { id, msg, sub, kind, leaving: false }])
      const dwell = opts.dwell || 2600
      setTimeout(() => {
        setList(l => l.map(t => t.id === id ? { ...t, leaving: true } : t))
        setTimeout(() => setList(l => l.filter(t => t.id !== id)), 200)
      }, dwell)
    }
    return () => { _dispatch = null }
  }, [])

  const iconFor = (kind: ToastItem['kind']) => {
    if (kind === 'good') return <Ihr.Check size={12} />
    if (kind === 'bad')  return <Ihr.X size={12} />
    if (kind === 'warn') return <Ihr.Bell size={12} />
    return <Ihr.Check size={12} />
  }

  return (
    <div className="toast-wrap">
      {list.map(t => (
        <div className={"toast " + t.kind + (t.leaving ? " leaving" : "")} key={t.id}>
          <div className="ti">{iconFor(t.kind)}</div>
          <div>
            <b>{t.msg}</b>
            {t.sub ? <small>{t.sub}</small> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Popover
// ---------------------------------------------------------------------------

export interface PopoverProps {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  onClose?: () => void
  children?: React.ReactNode
  align?: 'right' | 'left'
  offset?: number
  className?: string
}

export function Popover({
  open,
  anchorRef,
  onClose,
  children,
  align = 'right',
  offset = 8,
  className = '',
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current?.contains(e.target as Node)) return
      if (anchorRef?.current?.contains(e.target as Node)) return
      onClose?.()
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!open) return null
  const rect = anchorRef?.current?.getBoundingClientRect()
  if (!rect) return null

  const style: React.CSSProperties = { top: rect.bottom + offset }
  if (align === 'right') (style as Record<string, unknown>).right = window.innerWidth - rect.right
  else (style as Record<string, unknown>).left = rect.left

  return (
    <div ref={ref} className={"popover " + className} style={style}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MenuPopover
// ---------------------------------------------------------------------------

export interface MenuItemDef {
  sep?: boolean
  title?: string
  label?: string
  icon?: React.ReactNode
  active?: boolean
  right?: string
  onClick?: () => void
}

export interface MenuPopoverProps {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  onClose?: () => void
  items: MenuItemDef[]
  align?: 'right' | 'left'
}

export function MenuPopover({ open, anchorRef, onClose, items, align = 'right' }: MenuPopoverProps) {
  return (
    <Popover open={open} anchorRef={anchorRef} onClose={onClose} align={align}>
      {items.map((it, i) => {
        if (it.sep) return <div className="popover-sep" key={i} />
        if (it.title) return <div className="popover-title" key={i}>{it.title}</div>
        return (
          <button
            className={"popover-item" + (it.active ? " active" : "")}
            key={i}
            onClick={() => { it.onClick?.(); onClose?.() }}
          >
            {it.icon ? <span className="ico">{it.icon}</span> : null}
            {it.label}
            {it.right ? <span className="right">{it.right}</span> : null}
          </button>
        )
      })}
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// NotificationsPopover
// ---------------------------------------------------------------------------

export interface NotificationsPopoverProps {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  onClose?: () => void
  onOpenProfile?: (id: number) => void
}

const NOTIFICATIONS: Array<{
  id: number
  who: number
  unread: boolean
  msg: React.ReactNode
  when: string
}> = [
  { id: 1, who: 7,  unread: true,  msg: <><b>Григорий Зимин</b> <span className="muted">провалил сценарий</span> <b>«Возражение по комиссии»</b></>,              when: "2 мин"  },
  { id: 2, who: 10, unread: true,  msg: <><b>Виктория Иванова</b> <span className="muted">завершила сценарий с баллом</span> <b>98%</b></>,                        when: "9 мин"  },
  { id: 3, who: 1,  unread: true,  msg: <><b>Никита Соловьёв</b> <span className="muted">прислал запись на проверку</span></>,                                      when: "14 мин" },
  { id: 4, who: 9,  unread: false, msg: <><b>Кирилл Беляков</b> <span className="muted">пропустил дедлайн модуля</span> <b>«Антифрод»</b></>,                       when: "1 ч"    },
  { id: 5, who: 4,  unread: false, msg: <><b>Елизавета Михайлова</b> <span className="muted">получила бейдж</span> <b>«Эмпатия 2.0»</b></>,                        when: "3 ч"    },
  { id: 6, who: 8,  unread: false, msg: <><b>Полина Карасёва</b> <span className="muted">не выходила в систему 2 дня</span></>,                                     when: "вчера"  },
]

export function NotificationsPopover({ open, anchorRef, onClose, onOpenProfile }: NotificationsPopoverProps) {
  const [seen, setSeen] = useState(false)
  return (
    <Popover open={open} anchorRef={anchorRef} onClose={onClose} align="right" className="notif-pop">
      <div className="notif-head">
        <h3>Уведомления</h3>
        <a onClick={() => { setSeen(true); hrToast("Все уведомления отмечены прочитанными", { kind: "good" }) }}>
          Прочитать все
        </a>
      </div>
      <div className="notif-list">
        {NOTIFICATIONS.map(n => {
          const e = hrData.EMPLOYEES.find(x => x.id === n.who)!
          const unread = !seen && n.unread
          return (
            <div
              className={"notif-item" + (unread ? " unread" : "")}
              key={n.id}
              onClick={() => { onOpenProfile?.(n.who); onClose?.() }}
            >
              <div className={"av-mini " + e.avClass}>{e.initials}</div>
              <div className="body">
                {n.msg}
                <span className="when">{n.when} назад</span>
              </div>
              {unread ? <span className="dot-mark" /> : <span />}
            </div>
          )
        })}
      </div>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// UserMenuPopover
// ---------------------------------------------------------------------------

export interface UserMenuPopoverProps {
  open: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  onClose?: () => void
  onAction?: (a: string) => void
}

export function UserMenuPopover({ open, anchorRef, onClose, onAction }: UserMenuPopoverProps) {
  const [status, setStatus] = useState<'online'|'dnd'>('online')
  return (
    <Popover open={open} anchorRef={anchorRef} onClose={onClose} align="right" className="user-pop">
      <div className="user-pop-head">
        <div className={"av " + hrData.HR_USER.avClass}>{hrData.HR_USER.initials}</div>
        <div>
          <b>{hrData.HR_USER.name}</b>
          <small>hr.karpova@bank.synth</small>
        </div>
      </div>
      <button
        className="popover-item"
        onClick={() => { onAction?.("profile"); hrToast("Открыт ваш профиль", { sub: "HRBP · Корпоратив" }); onClose?.() }}
      >
        <Ihr.User size={15} className="ico" /> Мой профиль
      </button>
      <button
        className="popover-item"
        onClick={() => { onAction?.("settings"); onClose?.() }}
      >
        <Ihr.Settings size={15} className="ico" /> Настройки
      </button>
      <button
        className="popover-item"
        onClick={() => { hrToast("Переключаюсь на песочницу 2026/Q3"); onClose?.() }}
      >
        <Ihr.Swap size={15} className="ico" /> Сменить песочницу
        <span className="right">2026/Q2</span>
      </button>
      <div className="popover-sep" />
      <div className="popover-title">Статус</div>
      <button
        className="popover-item"
        style={status === 'online' ? {fontWeight:600} : undefined}
        onClick={() => { setStatus('online'); hrToast('Статус: в сети', {kind:'good'}); onClose?.() }}
      >
        <span className="ico">
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--good)' }} />
        </span>
        В сети
      </button>
      <button
        className="popover-item"
        style={status === 'dnd' ? {fontWeight:600} : undefined}
        onClick={() => { setStatus('dnd'); hrToast('Статус: не беспокоить', {kind:'warn'}); onClose?.() }}
      >
        <span className="ico">
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--bad)' }} />
        </span>
        Не беспокоить
      </button>
      <div className="popover-sep" />
      <button
        className="popover-item"
        onClick={() => {
          useSettingsStore.getState().setRole('intern')
          onClose?.()
        }}
      >
        <Ihr.ArrowL size={15} className="ico" /> Выйти
      </button>
    </Popover>
  )
}
