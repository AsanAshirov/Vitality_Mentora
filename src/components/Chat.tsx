// Chat.tsx — Gemini-powered RAG chat (streaming, <1s first token)
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { I } from './Icons'
import { useSettingsStore } from '../store/settingsStore'
import { streamGeminiAnswer } from '../lib/gemini'
import { speak, stopSpeaking } from '../lib/tts'
import { startListening, isSTTSupported } from '../lib/stt'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: 'bot' | 'user'
  text: string
  sources?: string[]
  streaming?: boolean
}

export interface ChatWidgetProps {
  open: boolean
  onClose: () => void
  lang?: string
}

// ─── Seed message ─────────────────────────────────────────────────────────────

const makeSeed = (lang: string): Message => ({
  role: 'bot',
  text: lang === 'UZ'
    ? "Salom! Men <b>Mentora AI yordamchisiman</b>. Bankning har qanday protsedurasi bo'yicha so'rang — KYC, sanktsiyalar, AML, o'tkazmalar, depozitlar, kartalar. Faqat hujjatlashtirilgan ma'lumotlardan javob beraman."
    : lang === 'EN'
    ? "Hi! I'm the <b>Mentora AI assistant</b>. Ask me anything about bank procedures — KYC, sanctions, AML, transfers, deposits, cards. Answers sourced only from the official handbook."
    : 'Привет! Я — <b>Mentora AI-ассистент</b>. Спрашивай о любых процедурах банка — KYC, санкции, AML, переводы, депозиты, карты. Отвечаю только по официальным документам.',
  sources: [],
})

// ─── Quick suggestions ────────────────────────────────────────────────────────

const SUGGESTIONS: Record<string, string[]> = {
  RU: ['Документы для KYC', 'Что делать при санкционном хите?', 'Лимиты SWIFT-переводов', 'Порог декларации ИС', 'Как эскалировать?', 'Правила AML/STR'],
  UZ: ["KYC uchun hujjatlar", "Sanksiya hiti bo'lsa nima qilish kerak?", "SWIFT o'tkazma limitleri", "AML/STR qoidalari", "Eskalatsiya tartibi", "PEP bilan ishlash"],
  EN: ['KYC document list', 'Sanctions hit — what to do?', 'SWIFT transfer limits', 'Source of funds threshold', 'How to escalate?', 'AML/STR rules'],
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────

function ChatMessage({ m }: { m: Message }) {
  if (m.role === 'user') {
    return <div className="chat-msg user">{m.text}</div>
  }

  const showSources = m.sources && m.sources.length > 0

  return (
    <div className="chat-msg bot">
      {m.text.split('\n').map((line, i) => (
        line.trim()
          ? <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
          : <br key={i} />
      ))}
      {showSources && !m.streaming && (
        <div className="sources">
          <div className="sources-label">Источники</div>
          {m.sources!.map(s => (
            <span key={s} className="cite">{s}</span>
          ))}
        </div>
      )}
      {m.streaming && (
        <span className="stream-cursor">▍</span>
      )}
    </div>
  )
}

// ─── ChatWidget ───────────────────────────────────────────────────────────────

export function ChatWidget({ open, onClose, lang: langProp }: ChatWidgetProps) {
  const storeLang = useSettingsStore(s => s.lang)
  const lang = (langProp ?? storeLang) as 'RU' | 'UZ' | 'EN'

  const [messages, setMessages] = useState<Message[]>(() => [makeSeed(lang)])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakEnabled, setSpeakEnabled] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const stopSTT = useRef<(() => void) | null>(null)
  const streamingIndex = useRef<number>(-1)

  // Reset seed when lang changes
  useEffect(() => {
    setMessages([makeSeed(lang)])
  }, [lang])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, busy])

  const ask = useCallback(async (q: string) => {
    if (!q.trim() || busy) return
    setInput('')
    setBusy(true)

    const userMsg: Message = { role: 'user', text: q }
    const botMsg: Message = { role: 'bot', text: '', sources: [], streaming: true }

    setMessages(prev => {
      const next = [...prev, userMsg, botMsg]
      streamingIndex.current = next.length - 1
      return next
    })

    await streamGeminiAnswer(
      q,
      lang,
      // onChunk — append streamed text
      (chunk) => {
        setMessages(prev => {
          const next = [...prev]
          const idx = streamingIndex.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text: next[idx].text + chunk }
          }
          return next
        })
      },
      // onDone
      (fullText, citations) => {
        setMessages(prev => {
          const next = [...prev]
          const idx = streamingIndex.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text: fullText, sources: citations, streaming: false }
          }
          return next
        })
        setBusy(false)
        if (speakEnabled) speak(fullText, lang)
      },
      // onError — show error message
      (err) => {
        console.error('Gemini error:', err)
        const fallback = lang === 'RU'
          ? 'Не удалось получить ответ. Попробуйте переформулировать вопрос.'
          : lang === 'UZ'
          ? "Javob olishda xatolik. Savolni qayta shakllantiring."
          : 'Could not get an answer. Please rephrase your question.'
        setMessages(prev => {
          const next = [...prev]
          const idx = streamingIndex.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text: fallback, streaming: false }
          }
          return next
        })
        setBusy(false)
      },
    )
  }, [busy, lang, speakEnabled])

  const toggleSTT = () => {
    if (listening) {
      stopSTT.current?.()
      setListening(false)
      return
    }
    if (!isSTTSupported()) return
    setListening(true)
    const stop = startListening(
      lang,
      (text) => {
        setInput(text)
        ask(text)
      },
      () => setListening(false),
      () => setListening(false),
    )
    stopSTT.current = stop
  }

  const toggleSpeak = () => {
    if (speakEnabled) stopSpeaking()
    setSpeakEnabled(v => !v)
  }

  if (!open) return null

  const placeholder =
    lang === 'RU' ? 'Спросите о процедурах банка…'
    : lang === 'UZ' ? 'Bank tartib-qoidalari haqida so\'rang…'
    : 'Ask about banking procedures…'

  const suggestions = SUGGESTIONS[lang] ?? SUGGESTIONS.RU

  return (
    <div className="chat-panel" role="dialog" aria-label="База знаний">
      <div className="chat-hd">
        <span className="pulse" />
        <div>
          <b>Mentora AI</b>
          <small>Gemini 2.0 Flash · RAG · {lang}</small>
        </div>
        <button
          className={`close ${speakEnabled ? 'active' : ''}`}
          onClick={toggleSpeak}
          aria-label="Озвучить ответы"
          title="Озвучить ответы"
          style={{ marginRight: 4, fontSize: 16 }}
        >
          🔊
        </button>
        <button className="close" onClick={onClose} aria-label="Закрыть">
          <I.X size={14} />
        </button>
      </div>

      <div className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <ChatMessage key={i} m={m} />
        ))}
        {busy && messages[messages.length - 1]?.streaming === false && (
          <div className="chat-msg typing"><i /><i /><i /></div>
        )}
      </div>

      <div className="chat-suggest">
        {suggestions.map(s => (
          <button key={s} onClick={() => ask(s)} disabled={busy}>
            {s}
          </button>
        ))}
      </div>

      <div className="chat-input">
        <input
          placeholder={placeholder}
          value={input}
          disabled={busy}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input) } }}
        />
        {isSTTSupported() && (
          <button
            className={`msg-att ${listening ? 'recording' : ''}`}
            onClick={toggleSTT}
            title={listening ? 'Остановить' : 'Голосовой ввод'}
            style={{ color: listening ? 'var(--bad)' : undefined }}
          >
            <I.Mic size={15} />
          </button>
        )}
        <button
          onClick={() => ask(input)}
          disabled={!input.trim() || busy}
          aria-label="Отправить"
        >
          <I.Send size={15} />
        </button>
      </div>
    </div>
  )
}

export default ChatWidget
