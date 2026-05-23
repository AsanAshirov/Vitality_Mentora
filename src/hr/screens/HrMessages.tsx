// HrMessages.tsx — direct conversations + chat thread + details rail
import { useState, useEffect, useRef } from 'react'
import hrData from '../hrData'
import { hrToast, MenuPopover, Popover } from '../hrToast'
import { Ihr } from '../iconsHr'
import Avatar from '../shell/Avatar'
import type { ThreadMsg, DirectConv, Employee } from '../hrTypes'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HrMessagesProps {
  openCall: (id: number | string, mode: string) => void
  initialConvId: string | null
  openProfile: (id: number) => void
}

// ---------------------------------------------------------------------------
// ConvList (module-internal)
// ---------------------------------------------------------------------------

interface ConvListProps {
  tab: string
  setTab: (t: string) => void
  q: string
  setQ: (v: string) => void
  convs: DirectConv[]
  activeId: string
  setActiveId: (id: string) => void
  unread: number
  showNewMsg: boolean
  setShowNewMsg: (v: boolean) => void
  openProfile: (id: number) => void
}

function ConvList({ tab, setTab, q, setQ, convs, activeId, setActiveId, unread, showNewMsg, setShowNewMsg, openProfile }: ConvListProps) {
  return (
    <div className="conv-list">
      <div className="conv-head">
        <h2>
          Сообщения
          <button title="Новое сообщение" onClick={() => setShowNewMsg(!showNewMsg)}><Ihr.Plus size={14} /></button>
        </h2>
        <div className="conv-search">
          <Ihr.Search size={14} />
          <input placeholder="Поиск" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>
      {showNewMsg && (
        <div style={{borderBottom:'1px solid var(--line)', maxHeight:200, overflowY:'auto'}}>
          {hrData.EMPLOYEES.slice(0,8).map(e => (
            <div key={e.id} onClick={() => { openProfile(e.id); setShowNewMsg(false); }}
                 style={{padding:'8px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer'}}
                 onMouseEnter={ev => ev.currentTarget.style.background='var(--surface-2)'}
                 onMouseLeave={ev => ev.currentTarget.style.background=''}>
              <div className={'av ' + e.avClass} style={{width:28,height:28,borderRadius:'50%',display:'grid',placeItems:'center',fontSize:10,color:'white'}}>{e.initials}</div>
              <div style={{fontSize:13}}>{e.name}</div>
            </div>
          ))}
        </div>
      )}
      <div className="conv-tabs">
        <button className={"conv-tab" + (tab === "all" ? " active" : "")} onClick={() => setTab("all")}>Все</button>
        <button className={"conv-tab" + (tab === "unread" ? " active" : "")} onClick={() => setTab("unread")}>Непрочитано{unread > 0 ? <span className="ct-badge">{unread}</span> : null}</button>
        <button className={"conv-tab" + (tab === "active" ? " active" : "")} onClick={() => setTab("active")}>В сети</button>
      </div>
      <div className="conv-scroll">
        {convs.map(c => {
          const e = hrData.EMPLOYEES.find(x => x.id === c.with)!
          return (
            <div className={"conv-item" + (activeId === c.id ? " active" : "")} key={c.id} onClick={() => setActiveId(c.id)}>
              <div className="av-wrap">
                <div className={"av " + e.avClass}>{e.initials}</div>
                <span className={"dot " + e.status} />
              </div>
              <div>
                <div className="ci-name">
                  <span className="name-text">{e.name}</span>
                </div>
                <div className="ci-preview">{c.preview}</div>
              </div>
              <div className="ci-meta">
                <span className="ci-when">{c.lastAt}</span>
                {c.unread ? <span className="ci-unread">{c.unread}</span> : null}
              </div>
            </div>
          )
        })}
        {convs.length === 0 ? (
          <div style={{ padding: '28px 20px', color: 'var(--mute)', fontSize: 13, textAlign: 'center' }}>
            Нет диалогов по фильтру
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ChatBar (module-internal)
// ---------------------------------------------------------------------------

interface ChatBarProps {
  peer: Employee
  openCall: (id: number | string, mode: string) => void
  openProfile: (id: number) => void
}

function ChatBar({ peer, openCall, openProfile }: ChatBarProps) {
  const chatMoreRef = useRef<HTMLButtonElement>(null)
  const [chatMoreOpen, setChatMoreOpen] = useState(false)

  return (
    <div className="chat-bar">
      <div className="av-wrap" style={{ position: 'relative', width: 40, height: 40, cursor: 'pointer' }}
           onClick={() => openProfile?.(peer.id)}>
        <div className={"av " + peer.avClass}>{peer.initials}</div>
        <span className={"dot " + peer.status} style={{ position: 'absolute', right: -1, bottom: -1, width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--surface)' }} />
      </div>
      <div className="head-meta" style={{ cursor: 'pointer' }} onClick={() => openProfile?.(peer.id)}>
        <b>{peer.name}</b>
        <span className={peer.status}>
          {peer.status === "online" ? "В сети, печатает…" : peer.status === "busy" ? "Занят" : peer.status === "away" ? "Отошёл" : "Не в сети"}
        </span>
      </div>
      <div className="head-actions">
        <button className="call-btn" title="Голосовой звонок" onClick={() => openCall(peer.id, "voice")}><Ihr.Phone size={16} /></button>
        <button className="call-btn primary" title="Видеозвонок" onClick={() => openCall(peer.id, "video")}><Ihr.Video size={16} /></button>
        <button className="call-btn" title="Профиль" onClick={() => openProfile?.(peer.id)}><Ihr.User size={16} /></button>
        <button className="call-btn" title="Меню" ref={chatMoreRef} onClick={() => setChatMoreOpen(v => !v)}><Ihr.More size={16} /></button>
      </div>
      <MenuPopover open={chatMoreOpen} anchorRef={chatMoreRef} onClose={() => setChatMoreOpen(false)} items={[
        {label:'Закрепить сообщение', onClick: () => hrToast('Сообщение закреплено',{kind:'good'})},
        {label:'Очистить историю', onClick: () => hrToast('История чата очищена',{kind:'warn'})},
        {sep:true},
        {label:'Экспортировать чат', onClick: () => hrToast('Чат экспортируется…')},
      ]}/>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ThreadItem (module-internal)
// ---------------------------------------------------------------------------

interface ThreadItemProps {
  m: ThreadMsg
  peer: Employee
}

function ThreadItem({ m, peer }: ThreadItemProps) {
  if (m.kind === "divider") return <div className="chat-divider">{m.text}</div>

  if (m.kind === "scenario") {
    return (
      <div className="bubble-row">
        <div className={"av-s " + peer.avClass}>{peer.initials}</div>
        <div className="scenario-pin">
          <div className="icn"><Ihr.Activity size={14} /></div>
          <div>
            <b>{m.title}</b>
            <small>Сценарий тренажёра · {m.status}</small>
          </div>
          <span className="scn-pct">{m.progress}%</span>
        </div>
      </div>
    )
  }

  if (m.kind === "call") {
    return (
      <div className={"bubble-row" + (m.direction === "outgoing" ? " me" : "")}>
        {m.direction !== "outgoing" ? <div className={"av-s " + peer.avClass}>{peer.initials}</div> : null}
        <div className={"call-card" + (m.direction === "missed" ? " missed" : "")}>
          <div className="icn"><Ihr.Phone size={14} /></div>
          <div>
            <b>{m.kind2 === "video" ? "Видеозвонок" : "Голосовой звонок"} · {m.direction === "outgoing" ? "исходящий" : m.direction === "incoming" ? "входящий" : "пропущенный"}</b>
            <small>{m.duration}</small>
          </div>
          <span className="when">{m.time}</span>
        </div>
      </div>
    )
  }

  if (m.kind === "file") {
    return (
      <div className="bubble-row">
        <div className={"av-s " + peer.avClass}>{peer.initials}</div>
        <div className="file-bubble">
          <div className="ft">{m.kindLabel}</div>
          <div>
            <b>{m.name}</b>
            <small>{m.size} · загрузил {peer.name.split(' ')[0]}</small>
          </div>
          <button className="icon-btn"><Ihr.Download size={13} /></button>
        </div>
      </div>
    )
  }

  // text (kind === "msg")
  const me = m.from === 0
  return (
    <div className={"bubble-row" + (me ? " me" : "")}>
      {!me ? <div className={"av-s " + peer.avClass}>{peer.initials}</div> : null}
      <div className="bubble">
        {m.text}
        <span className="time">{m.time}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composer (module-internal)
// ---------------------------------------------------------------------------

interface ComposerProps {
  draft: string
  setDraft: (v: string) => void
  onSend: () => void
  setThread: React.Dispatch<React.SetStateAction<ThreadMsg[]>>
}

function Composer({ draft, setDraft, onSend, setThread }: ComposerProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const emojiRef = useRef<HTMLButtonElement>(null)
  const [showEmoji, setShowEmoji] = useState(false)

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend() }
  }
  return (
    <>
      <input type="file" ref={fileRef} style={{display:'none'}} onChange={e => {
        const f = e.target.files?.[0]
        if (!f) return
        const ext = f.name.split('.').pop()?.toUpperCase() ?? 'FILE'
        const sizeKb = Math.round(f.size / 1024)
        const sizeStr = sizeKb > 1024 ? `${(sizeKb/1024).toFixed(1)} МБ` : `${sizeKb} КБ`
        setThread(t => [...t, {kind:'file' as const, name:f.name, size:sizeStr, kindLabel:ext, from:0, time:new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})}])
        e.target.value = ''
      }}/>
      <div className="composer">
        <div className="composer-inner">
          <button className="composer-icn" title="Файл" onClick={() => fileRef.current?.click()}><Ihr.Paperclip size={16} /></button>
          <textarea
            rows={1}
            placeholder="Напишите сообщение…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKey}
          />
          <button className="composer-icn" title="Эмодзи" ref={emojiRef} onClick={() => setShowEmoji(v => !v)}><Ihr.Smile size={16} /></button>
          <Popover open={showEmoji} anchorRef={emojiRef} onClose={() => setShowEmoji(false)} align="right">
            <div style={{display:'flex',flexWrap:'wrap',gap:6,padding:'10px 12px',width:180}}>
              {['🎉','👍','✅','❌','⚠️','💡','📝','🔥','💪','🎯','😊','👋','✋','🙏','👀'].map(em => (
                <span key={em} style={{fontSize:20,cursor:'pointer'}} onClick={() => { setDraft(d => d+em); setShowEmoji(false) }}>{em}</span>
              ))}
            </div>
          </Popover>
          <button className={"composer-send" + (draft.trim() ? "" : " disabled")} onClick={onSend} disabled={!draft.trim()}>
            <Ihr.Send size={14} />
          </button>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// ChatRail (module-internal)
// ---------------------------------------------------------------------------

interface ChatRailProps {
  peer: Employee
  openCall: (id: number | string, mode: string) => void
  openProfile: (id: number) => void
}

function ChatRail({ peer, openCall, openProfile }: ChatRailProps) {
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState('')

  return (
    <aside className="chat-rail">
      <div className="rail-profile">
        <div className={"av-big " + peer.avClass}>{peer.initials}</div>
        <h3>{peer.name}</h3>
        <p>{peer.role}</p>
        <div className="quick-acts">
          <button className="call-btn" title="Звонок" onClick={() => openCall(peer.id, "voice")}><Ihr.Phone size={15} /></button>
          <button className="call-btn primary" title="Видеосвязь" onClick={() => openCall(peer.id, "video")}><Ihr.Video size={15} /></button>
          <button className="call-btn" title="Профиль" onClick={() => openProfile?.(peer.id)}><Ihr.User size={15} /></button>
          <button className="call-btn" title="Заметка" onClick={() => setShowNote(v => !v)}><Ihr.Doc size={15} /></button>
        </div>
      </div>

      <div className="rail-section">
        <h4>Сводка</h4>
        <div className="rail-stat"><span>Балл</span><b>{peer.score}/100</b></div>
        <div className="rail-stat"><span>Сценариев</span><b>{peer.scenarios}</b></div>
        <div className="rail-stat"><span>Команда</span><b>{peer.team}</b></div>
        <div className="rail-stat"><span>Последняя активность</span><b>{peer.lastActive}</b></div>
        <div className="rail-stat"><span>Был онлайн</span><b style={{ color: peer.status === 'online' ? 'var(--good)' : 'var(--mute)' }}>{peer.status === "online" ? "сейчас" : "недавно"}</b></div>
      </div>

      <div className="rail-section">
        <h4>Текущий сценарий</h4>
        <div className="scenario-pin" style={{ maxWidth: '100%', marginBottom: 0 }}>
          <div className="icn"><Ihr.Activity size={14} /></div>
          <div>
            <b>Холодный звонок · Карта Gold</b>
            <small>Сценарий 14 · в процессе</small>
          </div>
          <span className="scn-pct">87%</span>
        </div>
      </div>

      <div className="rail-section">
        <h4>Файлы · {hrData.SHARED_FILES.length}</h4>
        {showNote ? (
          <>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Заметка о сотруднике…"
              style={{width:'100%',height:100,padding:'8px 10px',border:'1px solid var(--line-2)',borderRadius:'var(--r-sm)',background:'var(--paper)',fontSize:12,resize:'none',boxSizing:'border-box'}}
            />
            <button className="btn primary" style={{width:'100%',height:32,marginTop:8,fontSize:12}}
              onClick={() => { hrToast('Заметка сохранена',{kind:'good'}); setShowNote(false) }}>Сохранить</button>
          </>
        ) : (
          hrData.SHARED_FILES.map((f, i) => (
            <div className="rail-file" key={i} style={{ cursor: 'pointer' }}
                 onClick={() => {
                   const a = Object.assign(document.createElement('a'), {
                     href: URL.createObjectURL(new Blob([''], {type:'application/octet-stream'})),
                     download: f.name,
                   })
                   document.body.appendChild(a); a.click(); document.body.removeChild(a)
                 }}>
              <div className="ft">{f.kind}</div>
              <div>
                <b>{f.name}</b>
                <small>{f.size}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// HrMessages — default export
// ---------------------------------------------------------------------------

export default function HrMessages({ openCall, initialConvId, openProfile }: HrMessagesProps) {
  const [activeId, setActiveId] = useState<string>(initialConvId || "d1")
  const [tab, setTab] = useState("all")
  const [q, setQ] = useState("")
  const [draft, setDraft] = useState("")
  const [thread, setThread] = useState<ThreadMsg[]>(hrData.THREAD_D1)
  const [showNewMsg, setShowNewMsg] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [thread, activeId])

  let convs = hrData.DIRECT
  if (tab === "unread") convs = convs.filter(c => c.unread > 0)
  else if (tab === "active") convs = convs.filter(c => {
    const e = hrData.EMPLOYEES.find(x => x.id === c.with)
    return e?.status === "online"
  })
  if (q) convs = convs.filter(c => {
    const e = hrData.EMPLOYEES.find(x => x.id === c.with)
    return e?.name.toLowerCase().includes(q.toLowerCase())
  })

  const active = hrData.DIRECT.find(c => c.id === activeId)
  const peer = active ? hrData.EMPLOYEES.find(e => e.id === active.with) ?? null : null
  const unread = hrData.DIRECT.filter(c => c.unread > 0).length

  function send() {
    if (!draft.trim()) return
    setThread(t => [...t, { kind: "msg", from: 0, text: draft, time: "сейчас" }])
    setDraft("")
    // simulate reply
    setTimeout(() => {
      setThread(t => [...t, { kind: "msg", from: active?.with || 1, text: "Принято, спасибо!", time: "сейчас" }])
    }, 1400)
  }

  return (
    <div className="msg-shell">
      <ConvList
        tab={tab} setTab={setTab} q={q} setQ={setQ}
        convs={convs} activeId={activeId} setActiveId={setActiveId}
        unread={unread}
        showNewMsg={showNewMsg} setShowNewMsg={setShowNewMsg}
        openProfile={openProfile}
      />

      {peer ? (
        <div className="chat-pane">
          <ChatBar peer={peer} openCall={openCall} openProfile={openProfile} />
          <div className="chat-scroll" ref={scrollRef}>
            {thread.map((m, i) => <ThreadItem key={i} m={m} peer={peer} />)}
          </div>
          <Composer draft={draft} setDraft={setDraft} onSend={send} setThread={setThread} />
        </div>
      ) : (
        <div className="chat-pane">
          <div className="empty-state">
            <div>
              <div className="glyph"><Ihr.Message size={20} /></div>
              Выберите диалог
            </div>
          </div>
        </div>
      )}

      {peer ? <ChatRail peer={peer} openCall={openCall} openProfile={openProfile} /> : null}
    </div>
  )
}
