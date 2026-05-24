import React, { useState, useEffect, useRef } from 'react'
import './hr.css'
import { useSettingsStore } from '../store/settingsStore'
import hrData from './hrData'
import HrSidebar from './shell/HrSidebar'
import HrTopbar from './shell/HrTopbar'
import { HrToastHost, hrToast } from './hrToast'
import HrDashboard from './screens/HrDashboard'
import { HrEmployees, HrProfile } from './screens/HrEmployees'
import HrPerformance from './screens/HrPerformance'
import HrMessages from './screens/HrMessages'
import HrGroups from './screens/HrGroups'
import HrCallOverlay from './screens/HrCallOverlay'
import { HrCalendar, HrRequests, HrRewards, HrSettings } from './screens/HrExtra'

const COBALT_MAP: Record<string, string[]> = {
  '#2046FF': ['#2046FF', '#0F2BD9', '#0a1857', '#ECF0FF', '#DCE3FF', 'rgba(32, 70, 255, 0.18)'],
  '#5147E5': ['#5147E5', '#3A30C8', '#1C1755', '#EEEDFB', '#DCD9F7', 'rgba(81, 71, 229, 0.18)'],
  '#0E8A8A': ['#0E8A8A', '#066F6F', '#063535', '#E0F5F5', '#C2EAEA', 'rgba(14, 138, 138, 0.18)'],
  '#C42B7A': ['#C42B7A', '#9B1F60', '#4B0F2D', '#FCE5F0', '#F8C7DE', 'rgba(196, 43, 122, 0.18)'],
}

interface CallPeer {
  id: number | string
  mode: string
}

function PlaceholderScreen({ label }: { label: string }) {
  return (
    <div className="page">
      <div className="page-head">
        <div className="left">
          <h1>{label}</h1>
          <p>Раздел в разработке — продолжим в следующей итерации</p>
        </div>
      </div>
      <div style={{
        marginTop: 40, padding: '60px 24px', textAlign: 'center',
        background: 'var(--surface)', border: '1px dashed var(--line-2)',
        borderRadius: 'var(--r-lg)', color: 'var(--mute)', fontSize: 13,
      }}>
        Скоро — пока заглушка для следующих итераций
      </div>
    </div>
  )
}

export default function HrApp() {
  const { accent } = useSettingsStore()
  const [route, setRoute] = useState('dashboard')

  // Sidebar drag-to-resize
  const [sidebarWidth, setSidebarWidth] = useState(220)
  const [sidebarDragging, setSidebarDragging] = useState(false)
  const sidebarDragRef = useRef<{ startX: number; startW: number } | null>(null)

  function onSidebarResizeStart(e: React.MouseEvent) {
    e.preventDefault()
    sidebarDragRef.current = { startX: e.clientX, startW: sidebarWidth }
    setSidebarDragging(true)
    function onMove(ev: MouseEvent) {
      if (!sidebarDragRef.current) return
      const dx = ev.clientX - sidebarDragRef.current.startX
      setSidebarWidth(Math.max(160, Math.min(320, sidebarDragRef.current.startW + dx)))
    }
    function onUp() {
      sidebarDragRef.current = null
      setSidebarDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
  const [profileId, setProfileId] = useState<number | null>(null)
  const [callPeer, setCallPeer] = useState<CallPeer | null>(null)
  const [chatOpenId, setChatOpenId] = useState<string | null>(null)
  const [readConvIds, setReadConvIds] = useState<Set<string>>(new Set<string>())

  useEffect(() => {
    const v = COBALT_MAP[accent] || COBALT_MAP['#2046FF']
    const r = document.documentElement.style
    r.setProperty('--cobalt', v[0])
    r.setProperty('--cobalt-deep', v[1])
    r.setProperty('--cobalt-ink', v[2])
    r.setProperty('--cobalt-tint', v[3])
    r.setProperty('--cobalt-tint-2', v[4])
    r.setProperty('--cobalt-glow', v[5])
  }, [accent])

  const unreadDM = hrData.DIRECT.reduce((s, c) => s + (readConvIds.has(c.id) ? 0 : c.unread), 0)
  const unreadGroups = hrData.GROUPS.reduce((s, g) => s + g.unread, 0)

  function openProfile(id: number) { setProfileId(id); setRoute('profile') }
  function backFromProfile() { setProfileId(null); setRoute('employees') }
  function openChat(employeeId: number) {
    const conv = hrData.DIRECT.find(c => c.with === employeeId)
    setChatOpenId(conv ? conv.id : null)
    setRoute('messages')
  }
  function openCall(peerId: number | string, mode: string) { setCallPeer({ id: peerId, mode: mode || 'video' }) }
  function endCall() {
    hrToast('Звонок завершён', { kind: 'good', sub: 'Запись сохранена в карточку участника' })
    setCallPeer(null)
  }
  function markConvRead(id: string) {
    setReadConvIds(prev => new Set([...prev, id]))
  }

  const crumbsMap: Record<string, string[]> = {
    dashboard:   ['HR Mentora', 'Дашборд'],
    employees:   ['HR Mentora', 'Сотрудники'],
    profile:     ['HR Mentora', 'Сотрудники', profileId ? (hrData.EMPLOYEES.find(e => e.id === profileId)?.name ?? '') : ''],
    performance: ['HR Mentora', 'Performance'],
    messages:    ['HR Mentora', 'Сообщения'],
    groups:      ['HR Mentora', 'Групповые чаты'],
    calendar:    ['HR Mentora', 'Календарь'],
    requests:    ['HR Mentora', 'Заявки'],
    rewards:     ['HR Mentora', 'Награды'],
    settings:    ['HR Mentora', 'Настройки'],
  }

  const fullbleed = route === 'messages' || route === 'groups'

  let screen: React.ReactNode
  if (route === 'dashboard')    screen = <HrDashboard setRoute={setRoute} openProfile={openProfile} openChat={openChat} />
  else if (route === 'employees') screen = <HrEmployees openProfile={openProfile} openChat={openChat} openCall={openCall} />
  else if (route === 'profile')   screen = profileId ? <HrProfile id={profileId} onBack={backFromProfile} openChat={openChat} openCall={openCall} /> : null
  else if (route === 'performance') screen = <HrPerformance openProfile={openProfile} />
  else if (route === 'messages')  screen = <HrMessages openCall={openCall} initialConvId={chatOpenId} openProfile={openProfile} onMarkRead={markConvRead} />
  else if (route === 'groups')    screen = <HrGroups openCall={openCall} openProfile={openProfile} />
  else if (route === 'calendar')  screen = <HrCalendar openCall={openCall} openProfile={openProfile} />
  else if (route === 'requests')  screen = <HrRequests />
  else if (route === 'rewards')   screen = <HrRewards openProfile={openProfile} />
  else if (route === 'settings')  screen = <HrSettings openProfile={openProfile} />
  else screen = <PlaceholderScreen label={crumbsMap[route]?.[1] || route} />

  return (
    <div
      className="app app-hr"
      style={{
        gridTemplateColumns: `${sidebarWidth}px 4px 1fr`,
        userSelect: sidebarDragging ? 'none' : undefined,
      }}
    >
      <HrSidebar
        route={route}
        setRoute={(r) => { setRoute(r); if (r !== 'profile') setProfileId(null) }}
        unreadDM={unreadDM}
        unreadGroups={unreadGroups}
      />
      <div
        className={"resize-handle" + (sidebarDragging ? ' dragging' : '')}
        onMouseDown={onSidebarResizeStart}
      />
      <div className={'app-main' + (fullbleed ? ' fullbleed' : '')}>
        <HrTopbar
          crumbs={crumbsMap[route] || ['HR Mentora']}
          onOpenProfile={(id) => { if (id) openProfile(id) }}
          onOpenSettings={() => setRoute('settings')}
        />
        <React.Fragment key={route}>
          {screen}
        </React.Fragment>
      </div>

      {callPeer ? (
        <HrCallOverlay peerSpec={callPeer.id} mode={callPeer.mode} onEnd={endCall} />
      ) : null}

      <HrToastHost />
    </div>
  )
}
