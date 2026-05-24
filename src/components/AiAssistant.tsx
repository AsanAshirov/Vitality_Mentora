// AiAssistant.tsx — Floating AI Assistant with glassmorphism, FAQ chips, voice, doc upload
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { streamGeminiAnswer } from '../lib/gemini'
import { speak, stopSpeaking } from '../lib/tts'
import { startListening, isSTTSupported } from '../lib/stt'
import { useSettingsStore } from '../store/settingsStore'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Msg {
  role: 'user' | 'bot'
  text: string
  sources?: string[]
  streaming?: boolean
  attachment?: string // filename
}

// ─── FAQ chips ────────────────────────────────────────────────────────────────

const FAQ: Record<string, string[]> = {
  RU: [
    'Документы для KYC',
    'Лимит SWIFT',
    'Санкционный флаг',
    'Порог CTR / AML',
    'Открытие депозита',
    'Выпуск карты',
    'Эскалация к комплаенсу',
    'Курс валют ЦБ',
  ],
  UZ: [
    'KYC hujjatlari',
    'SWIFT limiti',
    'Sanktsiya bayrog\'i',
    'CTR / AML chegarasi',
    'Depozit ochish',
    'Karta chiqarish',
    'Compliance eskalatsiyasi',
    'CBU valyuta kursi',
  ],
  EN: [
    'KYC documents',
    'SWIFT limit',
    'Sanctions flag',
    'CTR / AML threshold',
    'Open a deposit',
    'Issue a card',
    'Escalate to compliance',
    'CBU exchange rate',
  ],
}

// ─── Seed messages ────────────────────────────────────────────────────────────

const SEED: Record<string, string> = {
  RU: 'Привет! Я ИИ-ассистент Mentora ✦\n\nЗадайте любой вопрос о банковских процедурах — KYC, санкции, AML, переводы, депозиты, карты. Можно прикрепить документ или воспользоваться голосовым вводом.',
  UZ: "Salom! Men Mentora AI-yordamchisiman ✦\n\nBank tartiblari haqida istalgan savol bering — KYC, sanktsiyalar, AML, o'tkazmalar, depozitlar, kartalar. Hujjat biriktirish yoki ovozli kiritishdan foydalanishingiz mumkin.",
  EN: "Hi! I'm Mentora AI Assistant ✦\n\nAsk anything about banking procedures — KYC, sanctions, AML, transfers, deposits, cards. You can attach a document or use voice input.",
}

const PLACEHOLDER: Record<string, string> = {
  RU: 'Задайте вопрос…',
  UZ: 'Savol bering…',
  EN: 'Ask a question…',
}

// ─── Glass style helpers ──────────────────────────────────────────────────────

const glass = {
  panel: {
    background: 'rgba(10, 14, 31, 0.82)',
    backdropFilter: 'blur(28px) saturate(180%)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 16px 56px rgba(0,0,0,0.45), 0 0 0 1px rgba(32,70,255,0.12) inset',
  } as React.CSSProperties,
  header: {
    background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  } as React.CSSProperties,
  input: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#e8eaf6',
  } as React.CSSProperties,
  bubble: {
    user: {
      background: 'linear-gradient(135deg, rgba(32,70,255,0.85), rgba(60,100,255,0.75))',
      border: '1px solid rgba(32,70,255,0.4)',
      color: '#fff',
    } as React.CSSProperties,
    bot: {
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.10)',
      color: '#dde2f8',
    } as React.CSSProperties,
  },
}

// ─── Bubble component ─────────────────────────────────────────────────────────

function Bubble({ m }: { m: Msg }) {
  const isUser = m.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      {!isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(32,70,255,0.9), rgba(100,130,255,0.8))',
          border: '1px solid rgba(32,70,255,0.5)',
          color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12, flexShrink: 0,
          marginRight: 8, marginTop: 2,
        }}>✦</div>
      )}
      <div style={{
        maxWidth: '82%',
        ...(isUser ? glass.bubble.user : glass.bubble.bot),
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        padding: '9px 13px',
        fontSize: 13,
        lineHeight: 1.55,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {m.attachment && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            marginBottom: 6, fontSize: 11.5,
            color: 'rgba(150,180,255,0.9)',
          }}>
            📎 {m.attachment}
          </div>
        )}
        <span dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br/>') }} />
        {m.streaming && (
          <span style={{
            display: 'inline-block', marginLeft: 2,
            animation: 'ai-blink .7s step-end infinite',
            color: 'rgba(100,140,255,0.9)',
          }}>▍</span>
        )}
        {m.sources && m.sources.length > 0 && !m.streaming && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {m.sources.map(s => (
              <span key={s} style={{
                fontSize: 10, fontFamily: 'monospace',
                background: 'rgba(32,70,255,0.2)',
                color: 'rgba(150,180,255,0.9)',
                borderRadius: 4, padding: '2px 5px',
                border: '1px solid rgba(32,70,255,0.3)',
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
  const [ttsOn, setTtsOn] = useState(false)
  const [recording, setRecording] = useState(false)
  const [docCtx, setDocCtx] = useState<{ name: string; content: string } | null>(null)
  const [inputFocused, setInputFocused] = useState(false)

  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamIdx = useRef(-1)
  const stopSTT = useRef<(() => void) | null>(null)

  // Reset seed on lang change
  useEffect(() => {
    setMsgs([{ role: 'bot', text: SEED[lang] ?? SEED.RU }])
  }, [lang])

  // Scroll to bottom
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [msgs])

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  // Stop TTS on close
  useEffect(() => {
    if (!open) stopSpeaking()
  }, [open])

  // Receive PTT result from Clicky backtick press
  useEffect(() => {
    const handler = (e: Event) => {
      const text = (e as CustomEvent<string>).detail
      if (!text) return
      setOpen(true)
      setTimeout(() => send(text), 100)
    }
    window.addEventListener('clicky-ptt-result', handler)
    return () => window.removeEventListener('clicky-ptt-result', handler)
  }, [send])

  // Hide FAB while user is typing anywhere on the page (except inside this panel)
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      const isOwnInput = inputRef.current?.contains(target)
      if (isInput && !isOwnInput) setInputFocused(true)
    }
    const onFocusOut = () => setInputFocused(false)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // ── Send message ──────────────────────────────────────────────────────────

  const send = useCallback(async (q: string) => {
    if (!q.trim() || busy) return
    setInput('')
    setBusy(true)

    const userMsg: Msg = {
      role: 'user',
      text: q,
      attachment: docCtx?.name,
    }
    const botMsg: Msg = { role: 'bot', text: '', sources: [], streaming: true }

    const capturedDoc = docCtx
    setDocCtx(null)

    setMsgs(prev => {
      const next = [...prev, userMsg, botMsg]
      streamIdx.current = next.length - 1
      return next
    })

    let fullText = ''

    await streamGeminiAnswer(
      q,
      lang,
      (chunk) => {
        fullText += chunk
        setMsgs(prev => {
          const next = [...prev]
          const idx = streamIdx.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text: next[idx].text + chunk }
          }
          return next
        })
      },
      (text, citations) => {
        setMsgs(prev => {
          const next = [...prev]
          const idx = streamIdx.current
          if (idx >= 0 && next[idx]) {
            next[idx] = { ...next[idx], text, sources: citations, streaming: false }
          }
          return next
        })
        setBusy(false)
        if (ttsOn) speak(text, lang).catch(() => {})
      },
      (_err) => {
        const errMsg = lang === 'RU'
          ? 'Не удалось получить ответ. Попробуйте ещё раз.'
          : lang === 'UZ'
          ? 'Javob olishda xatolik. Qayta urinib ko\'ring.'
          : 'Could not get a response. Please try again.'
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
      capturedDoc?.content,
    )
  }, [busy, lang, ttsOn, docCtx])

  // ── Voice input ───────────────────────────────────────────────────────────

  const toggleSTT = useCallback(() => {
    if (recording) {
      stopSTT.current?.()
      stopSTT.current = null
      setRecording(false)
      return
    }
    if (!isSTTSupported()) return
    setRecording(true)
    stopSTT.current = startListening(
      lang,
      (text) => {
        setInput(prev => (prev ? prev + ' ' + text : text))
      },
      () => {
        setRecording(false)
        stopSTT.current = null
      },
      () => {
        setRecording(false)
        stopSTT.current = null
      },
    )
  }, [recording, lang])

  // ── File upload ───────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        setDocCtx({ name: file.name, content: text.slice(0, 4000) })
      }
    }
    // Read as text; for non-text files just use filename as context hint
    if (file.type.startsWith('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else {
      setDocCtx({ name: file.name, content: `[Прикреплён файл: ${file.name}, тип: ${file.type}]` })
    }
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
    if (e.key === 'Escape') setOpen(false)
  }

  const clearHistory = () => setMsgs([{ role: 'bot', text: SEED[lang] ?? SEED.RU }])

  const faqs = FAQ[lang] ?? FAQ.RU

  return (
    <>
      <style>{`
        @keyframes ai-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ai-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        .ai-fab:hover { transform: scale(1.05) !important; }
        .ai-faq-chip:hover { background: rgba(32,70,255,0.35) !important; border-color: rgba(32,70,255,0.6) !important; }
        .ai-icon-btn:hover { background: rgba(255,255,255,0.12) !important; }
      `}</style>

      {/* ── Chat panel ── */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 130,
          right: 20,
          width: 370,
          height: 520,
          borderRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 8999,
          overflow: 'hidden',
          ...glass.panel,
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px',
            ...glass.header,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(32,70,255,0.9), rgba(100,130,255,0.8))',
              border: '1px solid rgba(32,70,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: '#fff',
            }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#e8eaf6' }}>Mentora AI</div>
              <div style={{ fontSize: 10.5, color: 'rgba(150,180,255,0.7)' }}>
                {lang === 'RU' ? 'только факты из документов'
                  : lang === 'UZ' ? 'faqat hujjatlardagi faktlar'
                  : 'facts from documents only'}
              </div>
            </div>

            {/* TTS toggle */}
            <button
              className="ai-icon-btn"
              onClick={() => { setTtsOn(v => !v); if (ttsOn) stopSpeaking() }}
              title={ttsOn ? 'Выключить озвучку' : 'Включить озвучку'}
              style={{
                background: ttsOn ? 'rgba(32,70,255,0.35)' : 'none',
                border: ttsOn ? '1px solid rgba(32,70,255,0.5)' : '1px solid transparent',
                borderRadius: 8, cursor: 'pointer',
                color: ttsOn ? 'rgba(150,180,255,1)' : 'rgba(150,180,255,0.5)',
                fontSize: 14, padding: '4px 7px',
                transition: 'all .15s',
              }}
            >🔊</button>

            {/* Clear */}
            <button
              className="ai-icon-btn"
              onClick={clearHistory}
              title={lang === 'RU' ? 'Очистить' : lang === 'UZ' ? 'Tozalash' : 'Clear'}
              style={{
                background: 'none', border: '1px solid transparent',
                borderRadius: 8, cursor: 'pointer',
                color: 'rgba(150,180,255,0.5)', fontSize: 13, padding: '4px 7px',
                transition: 'background .15s',
              }}
            >🗑</button>

            {/* Close */}
            <button
              className="ai-icon-btn"
              onClick={() => setOpen(false)}
              style={{
                background: 'none', border: '1px solid transparent',
                borderRadius: 8, cursor: 'pointer',
                color: 'rgba(200,210,255,0.6)', fontSize: 19, lineHeight: 1,
                padding: '2px 6px', transition: 'background .15s',
              }}
            >×</button>
          </div>

          {/* FAQ chips */}
          <div style={{
            display: 'flex', gap: 6, padding: '8px 12px 6px',
            overflowX: 'auto', flexShrink: 0,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            scrollbarWidth: 'none',
          }}>
            {faqs.map(q => (
              <button
                key={q}
                className="ai-faq-chip"
                onClick={() => send(q)}
                disabled={busy}
                style={{
                  whiteSpace: 'nowrap', flexShrink: 0,
                  background: 'rgba(32,70,255,0.15)',
                  border: '1px solid rgba(32,70,255,0.3)',
                  borderRadius: 20, padding: '4px 11px',
                  fontSize: 11.5, color: 'rgba(160,185,255,0.95)',
                  cursor: busy ? 'default' : 'pointer',
                  transition: 'all .15s', opacity: busy ? 0.5 : 1,
                }}
              >{q}</button>
            ))}
          </div>

          {/* Messages */}
          <div ref={bodyRef} style={{
            flex: 1, overflowY: 'auto', padding: '12px 12px 4px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}>
            {msgs.map((m, i) => <Bubble key={i} m={m} />)}
            {busy && msgs[msgs.length - 1]?.streaming === false && (
              <div style={{ display: 'flex', gap: 4, paddingLeft: 34, paddingBottom: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'rgba(100,140,255,0.8)', opacity: 0.6,
                    animation: `ai-blink .9s ${i * 0.2}s step-end infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Attachment preview */}
          {docCtx && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 12px',
              background: 'rgba(32,70,255,0.12)',
              borderTop: '1px solid rgba(32,70,255,0.2)',
              fontSize: 11.5, color: 'rgba(150,180,255,0.9)',
            }}>
              📎 <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docCtx.name}</span>
              <button
                onClick={() => setDocCtx(null)}
                style={{ background: 'none', border: 'none', color: 'rgba(200,200,255,0.5)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
              >×</button>
            </div>
          )}

          {/* Input bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 10px 10px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* File upload */}
            <input
              ref={fileRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
            />
            <button
              className="ai-icon-btn"
              onClick={() => fileRef.current?.click()}
              title={lang === 'RU' ? 'Прикрепить файл' : lang === 'UZ' ? 'Fayl biriktirish' : 'Attach file'}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: docCtx ? 'rgba(32,70,255,0.4)' : 'rgba(255,255,255,0.07)',
                color: docCtx ? 'rgba(150,180,255,1)' : 'rgba(150,180,255,0.6)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14, transition: 'background .15s',
              }}
            >📎</button>

            {/* Text input */}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              disabled={busy}
              placeholder={PLACEHOLDER[lang] ?? PLACEHOLDER.RU}
              style={{
                flex: 1, borderRadius: 20,
                padding: '8px 13px', fontSize: 13,
                outline: 'none',
                transition: 'border-color .15s',
                ...glass.input,
              }}
            />

            {/* Mic */}
            {isSTTSupported() && (
              <button
                className="ai-icon-btn"
                onClick={toggleSTT}
                title={recording
                  ? (lang === 'RU' ? 'Остановить' : lang === 'UZ' ? 'To\'xtatish' : 'Stop')
                  : (lang === 'RU' ? 'Голосовой ввод' : lang === 'UZ' ? 'Ovozli kiritish' : 'Voice input')}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: 'none', flexShrink: 0,
                  background: recording ? 'rgba(220,50,50,0.5)' : 'rgba(255,255,255,0.07)',
                  color: recording ? '#ff8080' : 'rgba(150,180,255,0.6)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 15,
                  animation: recording ? 'ai-pulse 1.2s ease-in-out infinite' : 'none',
                  transition: 'background .15s',
                }}
              >{recording ? '⏹' : '🎤'}</button>
            )}

            {/* Send */}
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || busy}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: input.trim() && !busy
                  ? 'linear-gradient(135deg, rgba(32,70,255,0.9), rgba(60,100,255,0.85))'
                  : 'rgba(255,255,255,0.07)',
                color: input.trim() && !busy ? '#fff' : 'rgba(150,180,255,0.3)',
                cursor: input.trim() && !busy ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'background .15s',
              }}
            >↑</button>
          </div>
        </div>
      )}

      {/* ── FAB button — icon-only when closed, hidden while typing elsewhere ── */}
      <button
        className="ai-fab"
        onClick={() => setOpen(v => !v)}
        title="Mentora AI"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: open ? 7 : 0,
          width: open ? 'auto' : 40,
          height: 40,
          padding: open ? '0 15px' : '0',
          background: open
            ? 'rgba(8, 12, 28, 0.55)'
            : 'linear-gradient(135deg, rgba(32,70,255,0.92), rgba(60,100,255,0.85))',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          color: '#fff',
          border: open
            ? '1px solid rgba(32,70,255,0.5)'
            : '1px solid rgba(32,70,255,0.2)',
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          boxShadow: '0 2px 14px rgba(32,70,255,0.18)',
          // Fade out when user is typing (and panel is closed)
          opacity: inputFocused && !open ? 0 : 1,
          pointerEvents: inputFocused && !open ? 'none' : 'auto',
          transition: 'opacity .25s ease, background .2s ease, width .2s ease',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <span style={{ fontSize: 15, flexShrink: 0, opacity: 0.9 }}>✦</span>
        {open && <span style={{ marginLeft: 2 }}>Mentora AI</span>}
        {!open && busy && (
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 6, height: 6, borderRadius: '50%',
            background: '#4ade80',
          }} />
        )}
      </button>
    </>
  )
}
