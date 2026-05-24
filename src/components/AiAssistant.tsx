// AiAssistant.tsx — Floating AI Assistant button + chat panel
// Fixed position, does not interfere with any other UI
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { streamGeminiAnswer } from '../lib/gemini'
import { useSettingsStore } from '../store/settingsStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  role: 'user' | 'bot'
  text: string
  sources?: string[]
  streaming?: boolean
}

// ─── Seed by lang ─────────────────────────────────────────────────────────────

const SEED: Record<string, string> = {
  RU: 'Привет! Я AI-ассистент Mentora 🤖\n\nЗадайте любой вопрос о банковских процедурах — KYC, санкции, AML, переводы, депозиты, карты. Отвечаю строго по документам, ничего не придумываю.',
  UZ: "Salom! Men Mentora AI-yordamchisiman 🤖\n\nBank tartiblari haqida istalgan savol bering — KYC, sanktsiyalar, AML, o'tkazmalar, depozitlar, kartalar. Faqat hujjatlarga asoslanib javob beraman.",
  EN: "Hi! I'm Mentora AI Assistant 🤖\n\nAsk anything about banking procedures — KYC, sanctions, AML, transfers, deposits, cards. I answer strictly from documented sources only.",
}

const PLACEHOLDER: Record<string, string> = {
  RU: 'Ваш вопрос…',
  UZ: 'Savolingiz…',
  EN: 'Your question…',
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ m }: { m: Msg }) {
  const isUser = m.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 10,
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--cobalt)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, flexShrink: 0, marginRight: 8, marginTop: 2,
        }}>✦</div>
      )}
      <div style={{
        maxWidth: '82%',
        background: isUser ? 'var(--cobalt)' : 'var(--surface-2)',
        color: isUser ? '#fff' : 'var(--ink)',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '10px 13px',
        fontSize: 13.5,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        <span dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>') }} />
        {m.streaming && (
          <span style={{
            display: 'inline-block',
            marginLeft: 2,
            animation: 'ai-blink .7s step-end infinite',
            color: 'var(--cobalt)',
          }}>▍</span>
        )}
        {m.sources && m.sources.length > 0 && !m.streaming && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {m.sources.map(s => (
              <span key={s} style={{
                fontSize: 10.5, fontFamily: 'var(--font-mono)',
                background: 'var(--surface)', color: 'var(--mute)',
                borderRadius: 4, padding: '2px 5px',
                border: '1px solid var(--line)',
              }}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AiAssistant ──────────────────────────────────────────────────────────────

export default function AiAssistant() {
  const lang = useSettingsStore(s => s.lang) as 'RU' | 'UZ' | 'EN'
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>(() => [{ role: 'bot', text: SEED[lang] ?? SEED.RU }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const streamIdx = useRef(-1)

  // Reset seed when lang changes
  useEffect(() => {
    setMsgs([{ role: 'bot', text: SEED[lang] ?? SEED.RU }])
  }, [lang])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [msgs])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  const send = useCallback(async (q: string) => {
    if (!q.trim() || busy) return
    setInput('')
    setBusy(true)

    const userMsg: Msg = { role: 'user', text: q }
    const botMsg: Msg = { role: 'bot', text: '', sources: [], streaming: true }

    setMsgs(prev => {
      const next = [...prev, userMsg, botMsg]
      streamIdx.current = next.length - 1
      return next
    })

    await streamGeminiAnswer(
      q,
      lang,
      (chunk) => {
        setMsgs(prev => {
          const next = [...prev]
          const idx = streamIdx.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text: next[idx].text + chunk }
          }
          return next
        })
      },
      (fullText, citations) => {
        setMsgs(prev => {
          const next = [...prev]
          const idx = streamIdx.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text: fullText, sources: citations, streaming: false }
          }
          return next
        })
        setBusy(false)
      },
      (_err) => {
        const errMsg = lang === 'RU'
          ? 'Не удалось получить ответ. Проверьте соединение.'
          : lang === 'UZ'
          ? 'Javob olishda xatolik yuz berdi.'
          : 'Failed to get a response. Check your connection.'
        setMsgs(prev => {
          const next = [...prev]
          const idx = streamIdx.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text: errMsg, streaming: false }
          }
          return next
        })
        setBusy(false)
      },
    )
  }, [busy, lang])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      {/* ── Blink animation ── */}
      <style>{`@keyframes ai-blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          width: 380,
          height: 520,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--surface)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--cobalt)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, flexShrink: 0,
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>AI Ассистент</div>
              <div style={{ fontSize: 11, color: 'var(--mute)' }}>
                Gemini 2.0 Flash · только факты из документов
              </div>
            </div>
            <button
              onClick={() => setMsgs([{ role: 'bot', text: SEED[lang] ?? SEED.RU }])}
              title="Очистить историю"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--mute)', fontSize: 12, padding: '4px 6px',
                borderRadius: 6,
              }}
            >🗑</button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--mute)', fontSize: 18, lineHeight: 1,
                padding: '4px 6px', borderRadius: 6,
              }}
            >×</button>
          </div>

          {/* Messages */}
          <div ref={bodyRef} style={{
            flex: 1, overflowY: 'auto', padding: '14px 14px 4px',
          }}>
            {msgs.map((m, i) => <Bubble key={i} m={m} />)}
            {busy && msgs[msgs.length - 1]?.streaming === false && (
              <div style={{ display: 'flex', gap: 4, paddingLeft: 36, paddingBottom: 8 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--cobalt)', opacity: 0.5,
                    animation: `ai-blink .9s ${i * 0.2}s step-end infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px',
            borderTop: '1px solid var(--line)',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              disabled={busy}
              placeholder={PLACEHOLDER[lang] ?? PLACEHOLDER.RU}
              style={{
                flex: 1, border: '1px solid var(--line)', borderRadius: 20,
                padding: '8px 14px', fontSize: 13.5,
                background: 'var(--surface-2)', outline: 'none',
                color: 'var(--ink)',
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || busy}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: input.trim() && !busy ? 'var(--cobalt)' : 'var(--line-2)',
                color: input.trim() && !busy ? '#fff' : 'var(--mute)',
                cursor: input.trim() && !busy ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'background .15s',
                flexShrink: 0,
              }}
            >↑</button>
          </div>
        </div>
      )}

      {/* ── FAB button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        title="AI Ассистент"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: open ? '10px 16px' : '10px 18px',
          background: open ? 'var(--surface)' : 'var(--cobalt)',
          color: open ? 'var(--cobalt)' : '#fff',
          border: open ? '1.5px solid var(--cobalt)' : 'none',
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          boxShadow: open ? 'none' : '0 4px 20px rgba(32,70,255,0.4)',
          transition: 'all .2s ease',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 16 }}>✦</span>
        AI Ассистент
        {!open && busy && (
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#4ade80',
            display: 'inline-block',
          }} />
        )}
      </button>
    </>
  )
}
