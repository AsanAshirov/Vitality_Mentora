import { useState, useEffect } from 'react'
import React from 'react'
import { Ihr } from '../iconsHr'
import hrData from '../hrData'

interface HrSidebarProps {
  route: string
  setRoute: (r: string) => void
  unreadDM: number
  unreadGroups: number
}

interface NavItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number | null
  onClick?: () => void
}

function HrBrand() {
  return (
    <div className="brand">
      <div className="brand-mark"><i /><i /></div>
      <div className="brand-name">mentora<em>·</em>hr</div>
    </div>
  )
}

function NavItem({ icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <button className={'nav-item' + (active ? ' active' : '')} onClick={onClick}>
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {badge != null ? <span className="nav-badge">{badge}</span> : null}
    </button>
  )
}

export default function HrSidebar({ route, setRoute, unreadDM, unreadGroups }: HrSidebarProps) {
  const [seenRoutes, setSeenRoutes] = useState<Set<string>>(new Set<string>())

  useEffect(() => {
    if (['messages', 'groups', 'requests'].includes(route)) {
      setSeenRoutes(prev => new Set([...prev, route]))
    }
  }, [route])

  const dmBadge = seenRoutes.has('messages') ? null : (unreadDM || null)
  const groupsBadge = seenRoutes.has('groups') ? null : (unreadGroups || null)
  const requestsBadge = seenRoutes.has('requests') ? null : 3

  return (
    <aside className="sidebar">
      <HrBrand />

      <div className="nav-section">
        <div className="nav-title">Главное</div>
        <NavItem icon={<Ihr.Dashboard />} label="Дашборд"    active={route === 'dashboard'}                          onClick={() => setRoute('dashboard')} />
        <NavItem icon={<Ihr.Team />}      label="Сотрудники" active={route === 'employees' || route === 'profile'}    onClick={() => setRoute('employees')} />
        <NavItem icon={<Ihr.Chart />}     label="Performance" active={route === 'performance'}                        onClick={() => setRoute('performance')} />
      </div>

      <div className="nav-section">
        <div className="nav-title">Общение</div>
        <NavItem icon={<Ihr.Message />}  label="Сообщения"     active={route === 'messages'}  onClick={() => setRoute('messages')}  badge={dmBadge} />
        <NavItem icon={<Ihr.Group />}    label="Групповые чаты" active={route === 'groups'}    onClick={() => setRoute('groups')}    badge={groupsBadge} />
        <NavItem icon={<Ihr.Calendar />} label="Календарь"     active={route === 'calendar'}  onClick={() => setRoute('calendar')} />
      </div>

      <div className="nav-section">
        <div className="nav-title">Операции</div>
        <NavItem icon={<Ihr.Doc />}      label="Заявки"    active={route === 'requests'} onClick={() => setRoute('requests')} badge={requestsBadge} />
        <NavItem icon={<Ihr.Award />}    label="Награды"   active={route === 'rewards'}  onClick={() => setRoute('rewards')} />
        <NavItem icon={<Ihr.Settings />} label="Настройки" active={route === 'settings'} onClick={() => setRoute('settings')} />
      </div>

      <div className="sidebar-foot">
        <div className="synth-tag">Синтетический банк · песочница</div>
        <div className="user-chip">
          <div className={'av ' + hrData.HR_USER.avClass}>{hrData.HR_USER.initials}</div>
          <div className="user-meta">
            <b>{hrData.HR_USER.name}</b>
            <span>HRBP · Корпоратив</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
