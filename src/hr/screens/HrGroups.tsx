// HrGroups.tsx — group chats (similar shell, group threads)
import { useState, useEffect, useRef } from 'react'
import React from 'react'
import hrData from '../hrData'
import { hrToast, MenuPopover } from '../hrToast'
import { Ihr } from '../iconsHr'
import Avatar from '../shell/Avatar'
import type { ThreadMsg } from '../hrTypes'
import type { Group, Employee } from '../hrTypes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HrGroupsProps {
  openCall: (id: number | string, mode: string) => void
  openProfile: (id: number) => void
}

// ---------------------------------------------------------------------------
// buildGroupThread — module-level, not exported
// ---------------------------------------------------------------------------

function buildGroupThread(groupId: string): ThreadMsg[] {
  if (groupId === 'g1') {
    return [
      { kind: 'divider', text: 'Сегодня · 09:14' },
      { kind: 'msg', from: 0,  text: 'Доброе утро, команда! Напоминаю: сегодня в 11:30 калибровка по сценариям недели. Подготовьте лучшую и самую трудную запись.', time: '09:14' },
      { kind: 'msg', from: 2,  text: 'Готова — у меня есть запись с трудным отказом по карте Gold', time: '09:21' },
      { kind: 'msg', from: 1,  text: 'Я тоже подготовил две — успели разобрать с ментором вчера', time: '09:28' },
      { kind: 'file', from: 2, name: 'Алина_Возражение_по_карте.mp4', size: '18.6 МБ', kindLabel: 'MP4' },
      { kind: 'msg', from: 5,  text: 'А можно прислать запись позже? Я приду на 5 минут позже — стою в пробке', time: '09:42' },
      { kind: 'msg', from: 0,  text: 'Конечно, Артём. Подключайся, когда сможешь.', time: '09:45' },
      { kind: 'call', by: 0, duration: '32 мин', count: 5, time: 'вчера, 11:30' },
      { kind: 'divider', text: '10:32' },
      { kind: 'msg', from: 11, text: 'Коллеги, кто прошёл «Антифрод базовый»? Поделитесь опытом 🙏', time: '10:32' },
      { kind: 'msg', from: 1,  text: 'Прошёл вчера — там главное не торопиться на двойных триггерах. Расскажу в личке.', time: '10:38' },
      { kind: 'msg', from: 8,  text: '@Алина можешь скинуть тот PDF с регламентом?', time: '10:41' },
      { kind: 'msg', from: 2,  text: 'Да, конечно — прикрепляю', time: '10:42' },
      { kind: 'file', from: 2, name: 'Антифрод_регламент.pdf', size: '1.2 МБ', kindLabel: 'PDF' },
    ]
  }
  if (groupId === 'g2') {
    return [
      { kind: 'divider', text: 'Сегодня · 09:48' },
      { kind: 'msg', from: 10, text: 'Загрузила обновлённый сценарий с новыми триггерами антифрода. Готов к тестированию.', time: '09:48' },
      { kind: 'file', from: 10, name: 'Антифрод_v2.scenario', size: '460 КБ', kindLabel: 'FILE' },
      { kind: 'msg', from: 3,  text: 'Тестирую сейчас. Заметил что на шаге 4 нужно ещё одно подтверждение', time: '10:02' },
      { kind: 'msg', from: 7,  text: 'Соглашусь — у меня тоже сработало некорректно', time: '10:08' },
      { kind: 'msg', from: 0,  text: 'Окей, добавим в бэклог. Виктория, поправишь к четвергу?', time: '10:11' },
      { kind: 'msg', from: 10, text: 'Да, успею.', time: '10:15' },
    ]
  }
  if (groupId === 'g3') {
    return [
      { kind: 'divider', text: 'Сегодня · 09:30' },
      { kind: 'system', text: 'Ольга добавила Григория Зимина в группу' },
      { kind: 'msg', from: 0,  text: 'Коллеги, добавила Григория — будет участвовать в калибровке корпоратив-кейсов.', time: '09:32' },
      { kind: 'msg', from: 7,  text: 'Спасибо! Готов подключиться', time: '09:48' },
      { kind: 'msg', from: 4,  text: 'Можно перенести встречу на 14:30? У меня налагается с сессией ментора', time: '09:58' },
      { kind: 'msg', from: 0,  text: 'Давайте обсудим — кто за 14:30?', time: '10:00' },
    ]
  }
  // g4
  return [
    { kind: 'divider', text: 'Вчера · 17:10' },
    { kind: 'msg', from: 6, text: 'Спасибо за разбор кейса по премиум-обслуживанию! Очень полезно про двойную верификацию.', time: '17:10' },
    { kind: 'msg', from: 0, text: 'Рада, что зашло. На следующей неделе разберём кейс с международным переводом.', time: '17:14' },
    { kind: 'msg', from: 9, text: '👏👏👏', time: '17:15' },
    { kind: 'msg', from: 12, text: 'Жду! Заранее посмотрю материалы.', time: '18:02' },
  ]
}

// ---------------------------------------------------------------------------
// GroupList — module-internal
// ---------------------------------------------------------------------------

interface GroupListProps {
  activeId: string
  setActiveId: (id: string) => void
  q: string
  setQ: (v: string) => void
  showNewGroup: boolean
  setShowNewGroup: (fn: (v: boolean) => boolean) => void
}

function GroupList({ activeId, setActiveId, q, setQ, showNewGroup, setShowNewGroup }: GroupListProps) {
  const [newGroupName, setNewGroupName] = useState('')
  const filtered = hrData.GROUPS.filter(g => g.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="conv-list">
      <div className="conv-head">
        <h2>
          Группы
          <button
            title="Новая группа"
            onClick={() => setShowNewGroup(v => !v)}
          >
            <Ihr.Plus size={14} />
          </button>
        </h2>
        <div className="conv-search">
          <Ihr.Search size={14} />
          <input placeholder="Поиск групп" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      {showNewGroup && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface)' }}>
          <input
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="Название группы"
            style={{ width: '100%', height: 32, padding: '0 10px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn primary"
              style={{ height: 28, fontSize: 12 }}
              onClick={() => {
                if (!newGroupName.trim()) return
                hrToast('Группа создана', { kind: 'good', sub: newGroupName })
                setNewGroupName(''); setShowNewGroup(() => false)
              }}
            >
              Создать
            </button>
            <button
              className="btn ghost"
              style={{ height: 28, fontSize: 12 }}
              onClick={() => setShowNewGroup(() => false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      <div className="new-conv-callout">
        <Ihr.Group size={14} />
        <div><b>4 группы</b> · 26 участников всего</div>
      </div>
      <div className="conv-scroll" style={{ marginTop: 4 }}>
        {filtered.map(g => {
          const members = g.members.slice(0, 2).map(id => hrData.EMPLOYEES.find(e => e.id === id)!)
          return (
            <div
              className={'conv-item' + (activeId === g.id ? ' active' : '')}
              key={g.id}
              onClick={() => setActiveId(g.id)}
            >
              <div className="group-av">
                <div className={'gv ' + members[0].avClass}>{members[0].initials}</div>
                <div className={'gv ' + members[1].avClass}>{members[1].initials}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="ci-name">
                  <span className="name-text">{g.name}</span>
                  <span className="typ">{g.type}</span>
                </div>
                <div className="ci-preview">{g.preview}</div>
              </div>
              <div className="ci-meta">
                <span className="ci-when">{g.lastAt}</span>
                {g.unread ? <span className="ci-unread">{g.unread}</span> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GroupChatBar — module-internal
// ---------------------------------------------------------------------------

interface GroupChatBarProps {
  group: Group
  openCall: (id: number | string, mode: string) => void
  pinned: boolean
  setPinned: (fn: (v: boolean) => boolean) => void
  moreRef: React.RefObject<HTMLButtonElement | null>
  moreOpen: boolean
  setMoreOpen: (fn: (v: boolean) => boolean) => void
  setShowGroupSettings: (fn: (v: boolean) => boolean) => void
}

function GroupChatBar({ group, openCall, pinned, setPinned, moreRef, moreOpen, setMoreOpen, setShowGroupSettings }: GroupChatBarProps) {
  const memb = group.members.map(id => hrData.EMPLOYEES.find(e => e.id === id)!)
  return (
    <div className="chat-bar">
      <div className="group-av" style={{ width: 40, height: 40 }}>
        <div className={'gv ' + memb[0].avClass}>{memb[0].initials}</div>
        <div className={'gv ' + memb[1].avClass}>{memb[1].initials}</div>
      </div>
      <div className="head-meta">
        <b>{group.name}</b>
        <span className="online">
          {memb.length} участников · {memb.filter(m => m.status === 'online').length} в сети
        </span>
      </div>
      <div className="head-actions">
        <button className="call-btn" title="Голосовая встреча" onClick={() => openCall('group:' + group.id, 'voice')}>
          <Ihr.Phone size={16} />
        </button>
        <button className="call-btn primary" title="Видеовстреча" onClick={() => openCall('group:' + group.id, 'video')}>
          <Ihr.Video size={16} />
        </button>
        <button
          className="call-btn"
          title="Закрепить"
          style={pinned ? { color: 'var(--cobalt)' } : undefined}
          onClick={() => { setPinned(v => !v); hrToast(pinned ? 'Сообщение откреплено' : 'Сообщение закреплено', { kind: 'good' }) }}
        >
          <Ihr.Pin size={16} />
        </button>
        <div style={{ position: 'relative' }}>
          <button
            ref={moreRef}
            className="call-btn"
            title="Меню"
            onClick={() => setMoreOpen(v => !v)}
          >
            <Ihr.More size={16} />
          </button>
          <MenuPopover
            open={moreOpen}
            anchorRef={moreRef}
            onClose={() => setMoreOpen(() => false)}
            items={[
              { label: 'Пригласить участника', onClick: () => hrToast('Ссылка-приглашение скопирована', { kind: 'good' }) },
              { sep: true },
              { label: 'Экспорт истории', onClick: () => hrToast('История чата экспортируется…') },
              { label: 'Настройки группы', onClick: () => setShowGroupSettings(v => !v) },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GroupThreadItem — module-internal
// ---------------------------------------------------------------------------

interface GroupThreadItemProps {
  m: ThreadMsg
  group: Group
}

function GroupThreadItem({ m, group }: GroupThreadItemProps) {
  if (m.kind === 'divider') {
    return <div className="chat-divider">{m.text}</div>
  }
  if (m.kind === 'system') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <div className="bubble system">{m.text}</div>
      </div>
    )
  }
  if (m.kind === 'call') {
    const initiator = hrData.EMPLOYEES.find(e => e.id === m.by) || hrData.HR_USER
    return (
      <div className="bubble-row">
        <div className={'av-s ' + (initiator.avClass || 'av-1')}>{initiator.initials || 'ОК'}</div>
        <div className="call-card">
          <div className="icn"><Ihr.Video size={14} /></div>
          <div>
            <b>Групповой видеозвонок · {m.duration}</b>
            <small>Участвовали: {m.count} человек</small>
          </div>
          <span className="when">{m.time}</span>
        </div>
      </div>
    )
  }
  if (m.kind === 'file') {
    const sender = hrData.EMPLOYEES.find(e => e.id === m.from) || hrData.HR_USER
    return (
      <div className={'bubble-row' + (m.from === 0 ? ' me' : '')}>
        {m.from !== 0 ? <div className={'av-s ' + sender.avClass}>{sender.initials}</div> : null}
        <div className="file-bubble">
          <div className="ft">{m.kindLabel}</div>
          <div>
            <b>{m.name}</b>
            <small>{m.size} · от {sender.name?.split(' ')[0] || 'Ольги'}</small>
          </div>
          <button
            className="icon-btn"
            onClick={() => {
              const a = Object.assign(document.createElement('a'), {
                href: URL.createObjectURL(new Blob([''], { type: 'application/octet-stream' })),
                download: m.name || 'file',
              })
              document.body.appendChild(a); a.click(); document.body.removeChild(a)
            }}
          >
            <Ihr.Download size={13} />
          </button>
        </div>
      </div>
    )
  }
  const me = m.from === 0
  const sender = hrData.EMPLOYEES.find(e => e.id === m.from) || hrData.HR_USER
  return (
    <div className={'bubble-row' + (me ? ' me' : '')}>
      {!me ? <div className={'av-s ' + sender.avClass}>{sender.initials}</div> : null}
      <div className="bubble">
        {!me ? <span className="sender">{sender.name?.split(' ')[0] || 'Ольга'}</span> : null}
        {m.text}
        <span className="time">{m.time}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GroupSettingsForm — module-internal (owns groupNameEdit state)
// ---------------------------------------------------------------------------

interface GroupSettingsFormProps {
  group: Group
  setShowGroupSettings: (fn: (v: boolean) => boolean) => void
}

function GroupSettingsForm({ group, setShowGroupSettings }: GroupSettingsFormProps) {
  const [groupNameEdit, setGroupNameEdit] = useState('')
  return (
    <div style={{ marginTop: 8, padding: '12px', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)' }}>
      <label style={{ fontSize: 11, color: 'var(--mute)', display: 'block', marginBottom: 4 }}>Название группы</label>
      <input
        value={groupNameEdit}
        onChange={e => setGroupNameEdit(e.target.value)}
        placeholder={group?.name ?? ''}
        style={{ width: '100%', height: 30, padding: '0 8px', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', background: 'var(--paper)', fontSize: 12, boxSizing: 'border-box', marginBottom: 8 }}
      />
      <button
        className="btn primary"
        style={{ height: 28, fontSize: 11, width: '100%' }}
        onClick={() => { hrToast('Настройки сохранены', { kind: 'good' }); setShowGroupSettings(() => false) }}
      >
        Сохранить
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GroupRail — module-internal
// ---------------------------------------------------------------------------

interface GroupRailProps {
  group: Group
  openCall: (id: number | string, mode: string) => void
  openProfile: (id: number) => void
  showAddMember: boolean
  setShowAddMember: (fn: (v: boolean) => boolean) => void
  showGroupSettings: boolean
  setShowGroupSettings: (fn: (v: boolean) => boolean) => void
}

function GroupRail({ group, openCall, openProfile, showAddMember, setShowAddMember, showGroupSettings, setShowGroupSettings }: GroupRailProps) {
  const memb = group.members.map(id => hrData.EMPLOYEES.find(e => e.id === id)!)
  return (
    <aside className="chat-rail">
      <div className="rail-profile">
        <div className="group-av" style={{ width: 64, height: 64, margin: '0 auto 10px', position: 'relative' }}>
          <div
            className={'gv ' + memb[0].avClass}
            style={{ width: 38, height: 38, fontSize: 14, top: 0, left: 0, position: 'absolute', borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 500, border: '3px solid var(--surface)' }}
          >
            {memb[0].initials}
          </div>
          <div
            className={'gv ' + memb[1].avClass}
            style={{ width: 38, height: 38, fontSize: 14, bottom: 0, right: 0, position: 'absolute', borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 500, border: '3px solid var(--surface)' }}
          >
            {memb[1].initials}
          </div>
        </div>
        <h3>{group.name}</h3>
        <p>{group.type} · {memb.length} участников</p>
        <div className="quick-acts">
          <button className="call-btn" onClick={() => openCall('group:' + group.id, 'voice')}><Ihr.Phone size={15} /></button>
          <button className="call-btn primary" onClick={() => openCall('group:' + group.id, 'video')}><Ihr.Video size={15} /></button>
          <button
            className="call-btn"
            onClick={() => setShowAddMember(v => !v)}
          >
            <Ihr.Plus size={15} />
          </button>
          <button
            className="call-btn"
            onClick={() => setShowGroupSettings(v => !v)}
          >
            <Ihr.Settings size={15} />
          </button>
        </div>

        {showAddMember && (
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--line-2)' }}>
            <div style={{ fontSize: 11, color: 'var(--mute)', padding: '0 0 6px', fontWeight: 500 }}>Добавить участника</div>
            {hrData.EMPLOYEES.slice(0, 5).map(e => (
              <div
                key={e.id}
                onClick={() => { hrToast(`${e.name} добавлен в группу`, { kind: 'good' }); setShowAddMember(() => false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 12 }}
              >
                <div
                  className={'av ' + e.avClass}
                  style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 9, color: 'white' }}
                >
                  {e.initials}
                </div>
                {e.name}
              </div>
            ))}
          </div>
        )}

        {showGroupSettings && (
          <GroupSettingsForm group={group} setShowGroupSettings={setShowGroupSettings} />
        )}
      </div>

      <div className="rail-section">
        <h4>Участники · {memb.length}</h4>
        {memb.map(e => (
          <div
            key={e.id}
            style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: '1px dashed var(--line)', fontSize: 12.5, cursor: 'pointer' }}
            onClick={() => openProfile?.(e.id)}
          >
            <div className="av-wrap" style={{ position: 'relative' }}>
              <div
                className={'av ' + e.avClass}
                style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', color: 'white', fontSize: 10, fontWeight: 500 }}
              >
                {e.initials}
              </div>
              <span
                className={'dot ' + e.status}
                style={{ position: 'absolute', right: -1, bottom: -1, width: 9, height: 9, borderRadius: '50%', border: '2px solid var(--surface)' }}
              />
            </div>
            <div>
              <b style={{ fontWeight: 500 }}>{e.name}</b>
              <div style={{ fontSize: 10.5, color: 'var(--mute)', textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: 'var(--font-mono)' }}>{e.team}</div>
            </div>
            <span
              className={'score-x ' + (e.score >= 85 ? 'good' : e.score >= 70 ? 'mute' : e.score >= 60 ? 'warn' : 'bad')}
              style={{ fontSize: 11 }}
            >
              {e.score}
            </span>
          </div>
        ))}
      </div>

      <div className="rail-section">
        <h4>Закреплено</h4>
        <div
          className="scenario-pin"
          style={{ maxWidth: '100%', marginBottom: 8, cursor: 'pointer' }}
          onClick={() => hrToast('Калибровка · понедельник 11:30', { sub: 'Видеовстреча · 45 минут' })}
        >
          <div className="icn"><Ihr.Pin size={14} /></div>
          <div>
            <b>Калибровка · понедельник 11:30</b>
            <small>Разбор сценариев недели</small>
          </div>
        </div>
        <div
          className="rail-file"
          style={{ borderTop: '1px dashed var(--line)', cursor: 'pointer' }}
          onClick={() => {
            const a = Object.assign(document.createElement('a'), {
              href: URL.createObjectURL(new Blob([''], { type: 'application/octet-stream' })),
              download: 'Регламент_калибровки.pdf',
            })
            document.body.appendChild(a); a.click(); document.body.removeChild(a)
          }}
        >
          <div className="ft">PDF</div>
          <div>
            <b>Регламент_калибровки.pdf</b>
            <small>240 КБ · закреплено</small>
          </div>
        </div>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// HrGroups — default export
// ---------------------------------------------------------------------------

export default function HrGroups({ openCall, openProfile }: HrGroupsProps) {
  const [activeId, setActiveId] = useState<string>('g1')
  const [draft, setDraft] = useState<string>('')
  const [thread, setThread] = useState<ThreadMsg[]>(() => buildGroupThread('g1'))
  const scrollRef = useRef<HTMLDivElement>(null)

  // Drag-to-resize state
  const [convWidth, setConvWidth] = useState(320)
  const [railWidth, setRailWidth] = useState(280)
  const [dragging, setDragging] = useState<'conv' | 'rail' | null>(null)
  const dragRef = useRef<{ which: 'conv' | 'rail'; startX: number; startW: number } | null>(null)

  function onResizeStart(which: 'conv' | 'rail', e: React.MouseEvent) {
    e.preventDefault()
    const startW = which === 'conv' ? convWidth : railWidth
    dragRef.current = { which, startX: e.clientX, startW }
    setDragging(which)
    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      if (dragRef.current.which === 'conv') {
        setConvWidth(Math.max(220, Math.min(460, dragRef.current.startW + dx)))
      } else {
        setRailWidth(Math.max(200, Math.min(400, dragRef.current.startW - dx)))
      }
    }
    function onUp() {
      dragRef.current = null
      setDragging(null)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // GroupList state
  const [q, setQ] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)

  // GroupChatBar state
  const [pinned, setPinned] = useState(false)
  const moreRef = useRef<HTMLButtonElement>(null)
  const [moreOpen, setMoreOpen] = useState(false)

  // GroupRail state
  const [showAddMember, setShowAddMember] = useState(false)
  const [showGroupSettings, setShowGroupSettings] = useState(false)

  // Composer state
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [thread, activeId])

  useEffect(() => {
    setThread(buildGroupThread(activeId))
    // reset transient state when switching groups
    setShowAddMember(false)
    setShowGroupSettings(false)
    setPinned(false)
    setMoreOpen(false)
  }, [activeId])

  const active = hrData.GROUPS.find(g => g.id === activeId)

  function send() {
    if (!draft.trim()) return
    setThread(t => [...t, { kind: 'msg', from: 0, text: draft, time: 'сейчас' }])
    setDraft('')
    setTimeout(() => {
      if (!active) return
      const memberId = active.members[Math.floor(Math.random() * active.members.length)]
      setThread(t => [...t, { kind: 'msg', from: memberId, text: 'Принято! 👍', time: 'сейчас' }])
    }, 1300)
  }

  const cols = active
    ? `${convWidth}px 4px 1fr 4px ${railWidth}px`
    : `${convWidth}px 4px 1fr`

  return (
    <div
      className="msg-shell"
      style={{ gridTemplateColumns: cols, userSelect: dragging ? 'none' : undefined }}
    >
      <GroupList
        activeId={activeId}
        setActiveId={setActiveId}
        q={q}
        setQ={setQ}
        showNewGroup={showNewGroup}
        setShowNewGroup={setShowNewGroup}
      />

      <div
        className={"resize-handle" + (dragging === 'conv' ? ' dragging' : '')}
        onMouseDown={e => onResizeStart('conv', e)}
      />

      {active ? (
        <div className="chat-pane">
          <GroupChatBar
            group={active}
            openCall={openCall}
            pinned={pinned}
            setPinned={setPinned}
            moreRef={moreRef}
            moreOpen={moreOpen}
            setMoreOpen={setMoreOpen}
            setShowGroupSettings={setShowGroupSettings}
          />
          <div className="chat-scroll" ref={scrollRef}>
            {thread.map((m, i) => <GroupThreadItem key={i} m={m} group={active} />)}
          </div>
          <div className="composer">
            <button className="icon-btn" onClick={() => fileRef.current?.click()}>
              <Ihr.Paperclip size={16} />
            </button>
            <input
              ref={fileRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) hrToast(`Файл прикреплён: ${file.name}`, { kind: 'good' })
                e.target.value = ''
              }}
            />
            <input
              className="composer-input"
              placeholder="Сообщение группе…"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            />
            <button className="icon-btn" onClick={() => setDraft(d => d + ['😊','👍','🎉','✅','💡'][Math.floor(Math.random()*5)])}>
              <Ihr.Smile size={16} />
            </button>
            <button className="send-btn" onClick={send} disabled={!draft.trim()}>
              <Ihr.Send size={15} />
            </button>
          </div>
        </div>
      ) : null}

      {active ? (
        <>
          <div
            className={"resize-handle" + (dragging === 'rail' ? ' dragging' : '')}
            onMouseDown={e => onResizeStart('rail', e)}
          />
          <GroupRail
            group={active}
            openCall={openCall}
            openProfile={openProfile}
            showAddMember={showAddMember}
            setShowAddMember={setShowAddMember}
            showGroupSettings={showGroupSettings}
            setShowGroupSettings={setShowGroupSettings}
          />
        </>
      ) : null}
    </div>
  )
}
