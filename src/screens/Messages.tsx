// Messages.tsx — mini Telegram with HR, mentor, group chats, voice notes, calls
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useMessagesStore } from '../store/messagesStore'
import { SYNTH } from '../data/synth'
import { I } from '../components/Icons'
import { Resizable } from '../components/Resizable'
import type { Chat, ChatMessage } from '../store/messagesStore'

// ── Bot auto-reply map ────────────────────────────────────────────────────────

const BOT_REPLIES: Array<{ keys: string[]; reply: string }> = [
  {
    keys: ['kyc', 'кyc'],
    reply: 'По процедуре KYC-PROC v3.4 необходимо: 1) идентифицировать клиента по паспорту, 2) провести скрининг в санкционных списках, 3) оценить источник средств (ИС), 4) присвоить уровень риска. Источник: KYC-PROC §2–§4.',
  },
  {
    keys: ['депозит', 'вклад'],
    reply: 'Для оформления депозита: клиент должен быть идентифицирован (KYC), для суммы ≥ 50 млн UZS требуется декларация ИС (2-НДФЛ или эквивалент). Ставки и тарифы — DEPOSIT-OPS §3.',
  },
  {
    keys: ['санкции', 'sanctions'],
    reply: 'При санкционном хите с уверенностью > 50% — обязательна эскалация в комплаенс. Игнорировать или «очищать» хит разрешается только старшему комплаенс-офицеру с задокументированным решением. Источник: SANCTIONS-PROC §1.4.',
  },
  {
    keys: ['перевод', 'swift'],
    reply: 'SWIFT-переводы свыше $10 000 (или эквивалент) автоматически проходят AML-проверку. При срабатывании флага AML — эскалировать, не проводить самостоятельно. Комиссия физлиц: 0.25% + $15. Источник: TRANSFER-OPS §6.4.',
  },
  {
    keys: ['карта'],
    reply: 'Для выпуска карты: проверьте заявку в системе, подтвердите параметры (тип, тариф, лимиты), отправьте в очередь персонализации. Срок выпуска HUMO/UZCARD — 3–5 рабочих дней. Источник: CARD-ISSUE §2.',
  },
]

const DEFAULT_BOT_REPLY = 'Прости, не нашла ответ. Попробуй базу знаний или обратись к наставнику.'

function getBotReply(text: string): string {
  const lower = text.toLowerCase()
  for (const { keys, reply } of BOT_REPLIES) {
    if (keys.some(k => lower.includes(k))) return reply
  }
  return DEFAULT_BOT_REPLY
}

// ── New-chat contacts panel ───────────────────────────────────────────────────

interface ContactsPanelProps {
  onClose: () => void
  onOpenChat: (id: string) => void
}

function ContactsPanel({ onClose, onOpenChat }: ContactsPanelProps) {
  const contacts = [
    { id: 'hr-olga',     name: 'Ольга Р. (HR)',          short: 'ОР', cls: 'lilac' },
    { id: 'tatiana',     name: 'Татьяна К. (наставник)', short: 'ТК', cls: 'cobalt' },
    ...SYNTH.CUSTOMERS.map(c => ({
      id:    'synth-' + c.id,
      name:  c.name,
      short: c.short,
      cls:   '',
    })),
  ]

  return (
    <div className="contacts-panel" style={{
      position: 'absolute', top: '100%', left: 0, zIndex: 20,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, boxShadow: 'var(--shadow-lg)', minWidth: 260, padding: '8px 0',
    }}>
      <div style={{ padding: '6px 14px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ font: '600 12px/1 var(--font-mono)', textTransform: 'uppercase', color: 'var(--mute)', letterSpacing: '0.08em' }}>
          Контакты
        </span>
        <button className="btn btn-ghost btn-xs" onClick={onClose}><I.X size={11} /></button>
      </div>
      {contacts.map(c => (
        <button
          key={c.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', width: '100%', textAlign: 'left',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13.5,
          }}
          onClick={() => { onOpenChat(c.id); onClose() }}
        >
          <div className={`avatar ${c.cls}`} style={{ width: 28, height: 28, fontSize: 10 }}>{c.short}</div>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  )
}

// ── Scrubber ──────────────────────────────────────────────────────────────────

interface ScrubberProps {
  value: number
  max: number
  onChange: (v: number) => void
  height?: number
  color?: string
}

function Scrubber({ value, max, onChange, height = 6, color }: ScrubberProps) {
  const ref = useRef<HTMLDivElement>(null)
  const pct = Math.min(1, Math.max(0, value / (max || 1)))

  const updateFromEvent = useCallback((clientX: number) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    onChange(p * max)
  }, [max, onChange])

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const isTouch = e.type.startsWith('touch')
    const getX = (ev: MouseEvent | TouchEvent) =>
      isTouch ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX
    updateFromEvent(getX(e.nativeEvent as MouseEvent | TouchEvent))
    const move = (ev: MouseEvent | TouchEvent) => updateFromEvent(getX(ev))
    const up = () => {
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move as EventListener)
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', up)
    }
    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move as EventListener, { passive: false })
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', up)
  }

  return (
    <div
      className="scrubber"
      ref={ref}
      style={{ height, '--col': color ?? 'var(--cobalt)' } as React.CSSProperties}
      onMouseDown={onDown}
      onTouchStart={onDown}
    >
      <div className="scrubber-track" />
      <div className="scrubber-fill" style={{ width: `${pct * 100}%` }} />
      <div className="scrubber-thumb" style={{ left: `${pct * 100}%` }} />
    </div>
  )
}

// ── WaveScrubber ──────────────────────────────────────────────────────────────

interface WaveScrubberProps {
  value: number
  max: number
  onChange: (v: number) => void
  bars?: number
  seed?: number
}

function WaveScrubber({ value, max, onChange, bars = 32, seed = 1 }: WaveScrubberProps) {
  const ref = useRef<HTMLDivElement>(null)
  const pct = Math.min(1, Math.max(0, value / (max || 1)))
  const heights = React.useMemo(() => {
    const arr: number[] = []
    let x = seed
    for (let i = 0; i < bars; i++) {
      x = (x * 9301 + 49297) % 233280
      arr.push(0.25 + (x / 233280) * 0.75)
    }
    return arr
  }, [bars, seed])

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const isTouch = e.type.startsWith('touch')
    const getX = (ev: MouseEvent | TouchEvent) =>
      isTouch ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX
    const update = (cx: number) => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (cx - r.left) / r.width))
      onChange(p * max)
    }
    update(getX(e.nativeEvent as MouseEvent | TouchEvent))
    const move = (ev: MouseEvent | TouchEvent) => update(getX(ev))
    const up = () => {
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move as EventListener)
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', up)
    }
    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move as EventListener, { passive: false })
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', up)
  }

  return (
    <div className="wave-scrub" ref={ref} onMouseDown={onDown} onTouchStart={onDown}>
      {heights.map((h, i) => (
        <span
          key={i}
          className={i / bars <= pct ? 'wb-on' : 'wb-off'}
          style={{ height: `${h * 100}%` }}
        />
      ))}
    </div>
  )
}

// ── VoiceNote bubble ──────────────────────────────────────────────────────────

interface VoiceNoteProps { dur: number; dark?: boolean }

function VoiceNote({ dur, dark }: VoiceNoteProps) {
  const [playing, setPlaying] = useState(false)
  const [pos, setPos] = useState(0)
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setPos(p => {
        if (p >= dur) { setPlaying(false); return 0 }
        return p + 0.25
      })
    }, 250)
    return () => clearInterval(id)
  }, [playing, dur])
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  return (
    <div className={`voice-note${dark ? ' dark' : ''}`}>
      <button className="vn-play" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <I.Pause size={13} /> : <I.Play size={13} />}
      </button>
      <WaveScrubber value={pos} max={dur} onChange={setPos} seed={Math.floor(dur)} />
      <span className="vn-time mono">{fmt(playing ? pos : dur - pos)}</span>
    </div>
  )
}

// ── Message Bubble ────────────────────────────────────────────────────────────

interface BubbleProps { m: ChatMessage; group: boolean }

function Bubble({ m, group }: BubbleProps) {
  const isMe = m.from === 'me'
  return (
    <div className={`msg-bubble ${isMe ? 'me' : 'them'}${m.kind ? ` k-${m.kind}` : ''}`}>
      {!isMe && m.who && group && <div className="msg-from">{m.who}</div>}
      {m.kind === 'voice'
        ? <VoiceNote dur={m.dur ?? 10} dark={isMe} />
        : m.kind === 'file'
          ? (
            <div className="bub-file">
              <div className="bub-file-icon"><I.Doc size={16} /></div>
              <div><b>{(m as any).name}</b><small>{(m as any).size}</small></div>
            </div>
          )
          : m.kind === 'photo'
            ? <div className="bub-photo pl-img" style={{ width: (m as any).w ?? 240, height: (m as any).h ?? 160 }}>скрин-шот сценария</div>
            : <div className="msg-text">{m.text}</div>
      }
      <div className="msg-time mono">{m.t}{isMe && <I.Check size={10} style={{ marginLeft: 4 }} />}</div>
    </div>
  )
}

// ── Call Overlay ──────────────────────────────────────────────────────────────

interface CallOverlayProps { chat: Chat & { kind: 'audio' | 'video' }; onClose: () => void }

function CallOverlay({ chat, onClose }: CallOverlayProps) {
  const [sec, setSec] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cam, setCam] = useState(chat.kind === 'video')
  const [scrub, setScrub] = useState(0)
  const isVideo = chat.kind === 'video'
  const isGroup = chat.type === 'group'

  useEffect(() => {
    const t = setInterval(() => setSec(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => { setScrub(sec) }, [sec])

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const participants = isGroup
    ? [
        { name: 'Алексей П. (вы)', short: 'АП', cls: '' },
        { name: chat.name,         short: chat.short, cls: chat.cls },
        { name: 'Татьяна К.',      short: 'ТК', cls: 'cobalt' },
        { name: 'Дилноза К.',      short: 'ДК', cls: 'lilac' },
        { name: 'Бекзод Ю.',       short: 'БЮ', cls: 'teal' },
        { name: 'Жасур М.',        short: 'ЖМ', cls: 'rose' },
      ]
    : [
        { name: 'Алексей П. (вы)', short: 'АП', cls: '' },
        { name: chat.name,         short: chat.short, cls: chat.cls },
      ]

  return (
    <div className="call-overlay">
      <div className="call-bg" />
      <div className={`call-frame${isVideo ? ' video' : ' audio'}${isGroup ? ' group' : ''}`}>
        <div className="call-top">
          <div className="call-title">
            <div className={`avatar ${chat.cls}`} style={{ width: 30, height: 30, fontSize: 11 }}>{chat.short}</div>
            <div>
              <b>{chat.name}</b>
              <small>
                {isVideo ? 'Видеозвонок' : 'Аудиозвонок'} ·{' '}
                {isGroup ? `${participants.length} участников` : '1-на-1'}
              </small>
            </div>
          </div>
          <div className="call-quality">
            <span className="bar-q on" /><span className="bar-q on" />
            <span className="bar-q on" /><span className="bar-q dim" />
          </div>
        </div>

        <div className="call-stage">
          {isVideo ? (
            <div className={`tile-grid c-${Math.min(participants.length, 6)}`}>
              {participants.slice(0, 6).map((p, i) => (
                <div key={i} className={`call-tile ${p.cls}`}>
                  <div className={`avatar ${p.cls}`}>{p.short}</div>
                  <div className="call-tile-name">{p.name}{i === 0 && ' · вы'}</div>
                  {i === 0 && muted && <span className="tile-mute">muted</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="audio-stage">
              <div className={`avatar ${chat.cls}`} style={{ width: 120, height: 120, fontSize: 36 }}>{chat.short}</div>
              <div className="call-wave">
                {Array.from({ length: 28 }, (_, i) => (
                  <span key={i} style={{ height: `${20 + Math.abs(Math.sin(sec * 1.5 + i * 0.4)) * 60}%` }} />
                ))}
              </div>
              <h3>{chat.name}</h3>
              <p className="call-status">соединение установлено</p>
            </div>
          )}
        </div>

        <div className="call-timeline">
          <span className="mono">{fmt(scrub)}</span>
          <Scrubber value={scrub} max={Math.max(sec, 1)} onChange={setScrub} />
          <span className="mono mute-x">{fmt(sec)}</span>
        </div>

        <div className="call-controls">
          <button className={`call-btn${muted ? ' off' : ''}`} onClick={() => setMuted(m => !m)} title={muted ? 'Включить микрофон' : 'Выключить микрофон'}><I.Mic size={18} /></button>
          {isVideo && (
            <button className={`call-btn${!cam ? ' off' : ''}`} onClick={() => setCam(c => !c)} title="Камера"><I.Globe size={18} /></button>
          )}
          <button className="call-btn" title="Показать экран"><I.Upload size={18} /></button>
          <button className="call-btn" title="Чат во время звонка"><I.Chat size={18} /></button>
          <button className="call-btn" title="Участники"><I.User size={18} /></button>
          <button className="call-btn end" onClick={onClose} title="Завершить"><I.X size={20} /></button>
        </div>
      </div>
    </div>
  )
}

// ── Main MessagesPage ─────────────────────────────────────────────────────────

export function MessagesPage() {
  const { chats, activeId, sendMessage, markRead, openChat, addChat } = useMessagesStore()

  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'all' | 'dm' | 'group' | 'bot'>('all')
  const [query, setQuery] = useState('')
  const [calling, setCalling] = useState<(Chat & { kind: 'audio' | 'video' }) | null>(null)
  const [attachMenu, setAttachMenu] = useState(false)
  const [emojiMenu, setEmojiMenu] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSec, setRecordSec] = useState(0)
  const [showContacts, setShowContacts] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Resolve active chat object
  const activeChat = chats.find(c => c.id === activeId) ?? chats[0] ?? null

  // Filter sidebar list
  const filteredChats = chats.filter(c => {
    if (filter !== 'all' && c.type !== filter) return false
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  // Scroll to bottom when chat or messages change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [activeId, chats])

  // Recording timer
  useEffect(() => {
    if (!recording) { setRecordSec(0); return }
    const id = setInterval(() => setRecordSec(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [recording])

  const handleSelectChat = (chat: Chat) => {
    openChat(chat.id)
    markRead(chat.id)
  }

  const appendBotReply = (chatId: string, text: string) => {
    if (chatId !== 'ask-mentora') return
    setTimeout(() => {
      const reply = getBotReply(text)
      useMessagesStore.getState().chats  // force re-read after send
      // Inject bot message by calling addChat-like logic via store directly
      // We use a manual setState through the store's sendMessage trick:
      // The store only exposes sendMessage for "me", so we add a helper effect.
      // Instead use a raw store setState via getState().
      const store = useMessagesStore.getState()
      const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(useMessagesStore as any).setState((s: any) => ({
        chats: s.chats.map((c: Chat) => c.id === chatId
          ? {
              ...c,
              last: reply,
              lastT: now,
              msgs: [...c.msgs, { from: 'them' as const, t: now, text: reply, who: 'Mentora Bot' }],
            }
          : c
        ),
      }))
    }, 800 + Math.random() * 500)
  }

  const appendMentorReply = (chatId: string) => {
    const REPLIES: Record<string, string> = {
      tatiana:  'Принято. Загляну в твои заметки и отвечу подробнее ближе к обеду.',
      'hr-olga': 'Спасибо! Отметила в твоём плане недели.',
    }
    const r = REPLIES[chatId]
    if (!r) return
    setTimeout(() => {
      const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      ;(useMessagesStore as any).setState((s: any) => ({
        chats: s.chats.map((c: Chat) => c.id === chatId
          ? {
              ...c,
              last: r,
              lastT: now,
              msgs: [...c.msgs, { from: 'them' as const, t: now, text: r }],
            }
          : c
        ),
      }))
    }, 900 + Math.random() * 600)
  }

  const send = () => {
    if (!activeChat || !input.trim()) return
    const text = input.trim()
    sendMessage(activeChat.id, text)
    setInput('')
    setEmojiMenu(false)
    if (activeChat.id === 'ask-mentora') appendBotReply(activeChat.id, text)
    else appendMentorReply(activeChat.id)
  }

  const handleAttach = (kind: 'file' | 'photo' | 'poll' | 'loc') => {
    if (!activeChat) return
    setAttachMenu(false)
    const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const map: Record<string, ChatMessage> = {
      file:  { from: 'me', t: now, kind: 'file', ...(({ name: 'kyc_summary_2026-05.pdf', size: '184 КБ' }) as any) },
      photo: { from: 'me', t: now, kind: 'photo', ...(({ w: 240, h: 160 }) as any) },
      poll:  { from: 'me', t: now, ...(({ kind: 'poll', question: 'Когда удобно созвон?', opts: ['Сегодня 16:00', 'Завтра 11:00', 'Пятница 14:00'] }) as any) },
      loc:   { from: 'me', t: now, ...(({ kind: 'loc', place: 'Tashkent City · 23 этаж' }) as any) },
    }
    ;(useMessagesStore as any).setState((s: any) => ({
      chats: s.chats.map((c: Chat) => c.id === activeChat.id
        ? { ...c, msgs: [...c.msgs, map[kind]] }
        : c
      ),
    }))
    appendMentorReply(activeChat.id)
  }

  const handleEmoji = (e: string) => {
    setInput(input + e)
    setEmojiMenu(false)
  }

  const startRecord = () => setRecording(true)
  const stopRecord = (cancel: boolean) => {
    if (!cancel && recordSec > 0 && activeChat) {
      const dur = 5 + Math.floor(Math.random() * 25)  // random 5-30s
      const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      ;(useMessagesStore as any).setState((s: any) => ({
        chats: s.chats.map((c: Chat) => c.id === activeChat.id
          ? { ...c, msgs: [...c.msgs, { from: 'me' as const, t: now, kind: 'voice', dur }] }
          : c
        ),
      }))
      appendMentorReply(activeChat.id)
    }
    setRecording(false)
  }

  const handleNewChat = (contactId: string) => {
    // If chat already exists, just open it
    const existing = chats.find(c => c.id === contactId)
    if (existing) {
      openChat(contactId)
      markRead(contactId)
      return
    }
    // For synth customer chats — create a new one
    const synthCustomer = SYNTH.CUSTOMERS.find(c => 'synth-' + c.id === contactId)
    if (synthCustomer) {
      const now = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      addChat({
        id:     contactId,
        name:   synthCustomer.name,
        short:  synthCustomer.short,
        cls:    '',
        type:   'dm',
        last:   'Чат создан',
        lastT:  now,
        unread: 0,
        online: false,
        msgs:   [],
      })
    }
  }

  if (!activeChat) return null

  return (
    <div className="msg-shell screen-in" data-screen-label="Messages">
      {/* Sidebar */}
      <aside className="msg-list">
        <div className="msg-list-head">
          <h2>Сообщения</h2>
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-xs"
              onClick={() => setShowContacts(v => !v)}
            >
              <I.Plus size={12} /> Новый
            </button>
            {showContacts && (
              <ContactsPanel
                onClose={() => setShowContacts(false)}
                onOpenChat={handleNewChat}
              />
            )}
          </div>
        </div>

        <div className="msg-search">
          <I.Search size={13} />
          <input
            placeholder="Поиск чатов и сообщений…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="msg-search-clear" onClick={() => setQuery('')}>
              <I.X size={12} />
            </button>
          )}
        </div>

        <div className="msg-tabs">
          {([['all', 'Все'], ['dm', 'Личные'], ['group', 'Группы'], ['bot', 'Боты']] as const).map(([id, lbl]) => (
            <button
              key={id}
              className={filter === id ? 'active' : ''}
              onClick={() => setFilter(id)}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="msg-chats">
          {filteredChats.map(c => (
            <button
              key={c.id}
              className={`msg-chat${activeChat.id === c.id ? ' active' : ''}`}
              onClick={() => handleSelectChat(c)}
            >
              <div className={`avatar ${c.cls}`} style={{ position: 'relative' }}>
                {c.short}
                {c.online && <span className="online-dot" />}
              </div>
              <div className="msg-chat-main">
                <div className="msg-chat-top">
                  <b>{c.name}</b>
                  <span className="msg-t mono">{c.lastT}</span>
                </div>
                <div className="msg-chat-bot">
                  <span className="msg-preview">{c.last}</span>
                  {c.unread > 0 && <span className="unread">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
          {filteredChats.length === 0 && (
            <div className="dt-empty" style={{ padding: 22 }}>
              {query ? `Нет чатов по запросу «${query}»` : 'В этой категории пусто'}
            </div>
          )}
        </div>

        <Resizable side="right" cssVar="--msg-list-w" min={260} max={480} defaultSize={320} />
      </aside>

      {/* Thread */}
      <main className="msg-thread">
        <div className="msg-thread-head">
          <div className={`avatar ${activeChat.cls}`} style={{ position: 'relative' }}>
            {activeChat.short}
            {activeChat.online && <span className="online-dot" />}
          </div>
          <div className="msg-thread-meta">
            <b>{activeChat.name}</b>
            <span>
              {activeChat.type === 'group'
                ? `${(activeChat as any).members ?? ''} участников · ${activeChat.online ? 'активны' : 'тихо'}`
                : activeChat.online ? 'в сети' : 'был(а) недавно'}
            </span>
          </div>
          <div className="msg-thread-actions">
            <button className="msg-act-btn" title="Аудиозвонок" onClick={() => setCalling({ ...activeChat, kind: 'audio' })}><I.Mic size={15} /></button>
            <button className="msg-act-btn" title="Видеозвонок" onClick={() => setCalling({ ...activeChat, kind: 'video' })}><I.Globe size={15} /></button>
            <button className="msg-act-btn" title="Поиск в чате"><I.Search size={15} /></button>
            <button className="msg-act-btn" title="Подробности"><I.Help size={15} /></button>
          </div>
        </div>

        <div className="msg-body" ref={bodyRef}>
          <div className="msg-day">сегодня · {new Date().toLocaleDateString('ru-RU')}</div>
          {activeChat.msgs.map((m, i) => (
            <Bubble key={i} m={m} group={activeChat.type === 'group'} />
          ))}
        </div>

        {recording ? (
          <div className="msg-input recording">
            <span className="rec-dot" />
            <span className="rec-time mono">
              {String(Math.floor(recordSec / 60)).padStart(2, '0')}:{String(recordSec % 60).padStart(2, '0')}
            </span>
            <div className="rec-wave">
              {Array.from({ length: 20 }, (_, i) => (
                <span key={i} style={{ height: `${20 + Math.abs(Math.sin(recordSec * 1.4 + i * 0.6)) * 60}%` }} />
              ))}
            </div>
            <button className="rec-cancel" onClick={() => stopRecord(true)}>Отмена</button>
            <button className="msg-send" onClick={() => stopRecord(false)}><I.Send size={15} /></button>
          </div>
        ) : (
          <div className="msg-input">
            <div className="msg-input-side">
              <button
                className="msg-att"
                onClick={() => { setAttachMenu(v => !v); setEmojiMenu(false) }}
              >
                <I.Plus size={15} />
              </button>
              {attachMenu && (
                <div className="attach-menu" onMouseLeave={() => setAttachMenu(false)}>
                  <button onClick={() => handleAttach('file')}><I.Doc size={13} /> Файл</button>
                  <button onClick={() => handleAttach('photo')}><I.Upload size={13} /> Фото</button>
                  <button onClick={() => handleAttach('poll')}><I.Spark size={13} /> Опрос</button>
                  <button onClick={() => handleAttach('loc')}><I.Globe size={13} /> Локация</button>
                </div>
              )}
            </div>

            <input
              placeholder="Написать в чат…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => { setEmojiMenu(false); setAttachMenu(false) }}
              onKeyDown={e => { if (e.key === 'Enter') send() }}
            />

            <div className="msg-input-side">
              <button className="msg-att" onClick={() => { setEmojiMenu(v => !v); setAttachMenu(false) }}>😊</button>
              {emojiMenu && (
                <div className="emoji-menu emoji-menu-large" onMouseLeave={() => setEmojiMenu(false)}>
                  {[
                    // Реакции
                    '👍','👎','❤️','🔥','😂','😭','🙏','✨','🎉','💯',
                    // Работа / банк
                    '✅','❌','⚠️','🛡️','🔐','💰','💳','🏦','📋','📎',
                    // Общение
                    '💬','📞','📧','🤝','👋','💡','🎯','⏰','📅','🌐',
                    // Эмоции
                    '😊','😎','🤔','😅','🥳','😤','🫡','🤩','😇','🙌',
                    // Разное
                    '☕','🚀','💎','⭐','🏆','📊','💼','🔍','📌','✍️',
                  ].map(e => (
                    <button key={e} onClick={() => handleEmoji(e)}>{e}</button>
                  ))}
                </div>
              )}
            </div>

            {input.trim() ? (
              <button className="msg-send" onClick={send}><I.Send size={15} /></button>
            ) : (
              <button
                className="msg-send mic"
                title="Голосовое (зажать)"
                onMouseDown={startRecord}
                onMouseUp={() => stopRecord(false)}
                onTouchStart={startRecord}
                onTouchEnd={() => stopRecord(false)}
              >
                <I.Mic size={15} />
              </button>
            )}
          </div>
        )}
      </main>

      {calling && <CallOverlay chat={calling} onClose={() => setCalling(null)} />}
    </div>
  )
}

export default MessagesPage
