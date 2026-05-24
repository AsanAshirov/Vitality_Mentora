// Clicky.tsx — cursor companion with Google TTS voice + STT
import React, { useState, useEffect, useRef } from 'react'
import { speak, stopSpeaking } from '../lib/tts'
import { startListening, isSTTSupported } from '../lib/stt'
import { useSettingsStore } from '../store/settingsStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClickyProps {
  enabled: boolean
  mode: 'smart' | 'ghost'
  target?: string
  message?: { lead?: string; text: string; who?: string }
  onDismiss?: () => void
  summoned: boolean
  setSummoned: (v: boolean) => void
  autoSummoned?: boolean
  color?: string
}

interface Pos {
  x: number
  y: number
}

// ─── useEasedFollow ───────────────────────────────────────────────────────────

function useEasedFollow(target: React.RefObject<Pos>, smooth = 0.22): Pos {
  const [pos, setPos] = useState<Pos>({ x: -100, y: -100 })
  const raf = useRef<number>(0)
  const cur = useRef<Pos>({ x: -100, y: -100 })

  useEffect(() => {
    const tick = () => {
      const dx = target.current.x - cur.current.x
      const dy = target.current.y - cur.current.y
      cur.current.x += dx * smooth
      cur.current.y += dy * smooth
      setPos({ x: cur.current.x, y: cur.current.y })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, smooth])

  return pos
}

// ─── Clicky ───────────────────────────────────────────────────────────────────

function Clicky({
  enabled = true,
  mode = 'smart',
  target = undefined,
  message = undefined,
  onDismiss,
  summoned,
  setSummoned,
  autoSummoned = false,
  color = '#2046FF',
}: ClickyProps) {
  const lang = useSettingsStore(s => s.lang)
  const cursorPos = useRef<Pos>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  })
  const homePos = useRef<Pos>({ x: -100, y: -100 })
  const followTarget = useRef<Pos>({ x: -100, y: -100 })

  const [anchorRect, setAnchorRect] = useState<{
    x: number
    y: number
    w: number
    h: number
    right: number
    bottom: number
  } | null>(null)
  const [listening, setListening] = useState(false)
  const stopSTT = useRef<(() => void) | null>(null)
  const prevMsgText = useRef<string | undefined>(undefined)

  const effectiveSummoned = summoned || autoSummoned
  const pos = useEasedFollow(followTarget, 0.22)

  // Speak Clicky message when it changes (after effectiveSummoned is computed)
  useEffect(() => {
    const text = message?.text
    if (text && text !== prevMsgText.current && effectiveSummoned) {
      prevMsgText.current = text
      void speak(text, lang)
    }
    if (!effectiveSummoned) {
      stopSpeaking()
      prevMsgText.current = undefined
    }
  })

  // Track cursor
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: MouseEvent) => {
      // Trail 28px right + 22px below cursor so it never sits on click targets
      cursorPos.current = { x: e.clientX + 28, y: e.clientY + 22 }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [enabled])

  // Track home slot position
  useEffect(() => {
    const update = () => {
      const el = document.getElementById('clicky-rest')
      if (!el) return
      const r = el.getBoundingClientRect()
      homePos.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    update()
    const interval = setInterval(update, 250)
    window.addEventListener('resize', update)
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', update)
    }
  }, [])

  // Pick follow target each frame: summoned (manual or auto) → cursor, else → home
  useEffect(() => {
    let raf: number
    const tick = () => {
      followTarget.current = effectiveSummoned
        ? cursorPos.current
        : homePos.current
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [effectiveSummoned])

  // Anchored highlight (only when effectively summoned AND a target is set)
  useEffect(() => {
    if (mode !== 'smart' || !target || !effectiveSummoned) {
      setAnchorRect(null)
      return
    }
    const update = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-clicky-target="${target}"]`,
      )
      if (!el) {
        setAnchorRect(null)
        return
      }
      const r = el.getBoundingClientRect()
      setAnchorRect({
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        right: r.right,
        bottom: r.bottom,
      })
    }
    update()
    document
      .querySelectorAll('.main, .sim-main')
      .forEach(n => n.addEventListener('scroll', update, { passive: true }))
    window.addEventListener('resize', update)
    const interval = setInterval(update, 350)
    return () => {
      document
        .querySelectorAll('.main, .sim-main')
        .forEach(n => n.removeEventListener('scroll', update))
      window.removeEventListener('resize', update)
      clearInterval(interval)
    }
  }, [mode, target, effectiveSummoned])

  // Push-to-talk / summon — hold backtick + STT
  useEffect(() => {
    if (!enabled) return
    const down = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.repeat) {
        setListening(true)
        setSummoned(true)
        if (isSTTSupported()) {
          const stop = startListening(
            lang,
            (text) => {
              // Dispatch custom event so AiAssistant can pick it up
              window.dispatchEvent(new CustomEvent('clicky-ptt-result', { detail: text }))
            },
            () => { setListening(false) },
          )
          stopSTT.current = stop
        }
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setListening(false)
        setSummoned(false)
        stopSTT.current?.()
        stopSTT.current = null
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [enabled, setSummoned])

  if (!enabled) return null

  // Anchored bubble placement — tries right first, falls back left, then bottom
  let bubble: { x: number; y: number; side: 'right' | 'left' | 'bottom' } | null = null
  if (effectiveSummoned && anchorRect && message) {
    const placeRight = anchorRect.right + 320 < window.innerWidth - 24
    const placeLeft = !placeRight && anchorRect.x - 320 > 24
    if (placeRight) {
      bubble = {
        x: anchorRect.right + 18,
        y: anchorRect.y + anchorRect.h / 2,
        side: 'right',
      }
    } else if (placeLeft) {
      bubble = {
        x: anchorRect.x - 18,
        y: anchorRect.y + anchorRect.h / 2,
        side: 'left',
      }
    } else {
      bubble = {
        x: anchorRect.x + anchorRect.w / 2,
        y: anchorRect.bottom + 18,
        side: 'bottom',
      }
    }
  }

  return (
    <>
      {effectiveSummoned && anchorRect && (
        <div
          className="clicky-highlight"
          style={{
            left: anchorRect.x - 6,
            top: anchorRect.y - 6,
            width: anchorRect.w + 12,
            height: anchorRect.h + 12,
          }}
        />
      )}

      {bubble && message && (
        <div
          className={`clicky-bubble side-${bubble.side}`}
          style={{ left: bubble.x, top: bubble.y }}
          role="dialog"
        >
          <div className="who">
            <span className="live" style={{ background: color }} />
            {listening ? (
              <>
                Клик · слушаю{' '}
                <span className="wave">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </>
            ) : (
              <>Клик{message.who && ` · ${message.who}`}</>
            )}
          </div>
          {message.lead && (
            <p style={{ fontWeight: 500, marginBottom: 4 }}>{message.lead}</p>
          )}
          <p dangerouslySetInnerHTML={{ __html: message.text }} />
          {onDismiss && (
            <div className="actions">
              <button className="pill muted" onClick={onDismiss}>
                Понятно
              </button>
            </div>
          )}
        </div>
      )}

      <div
        className={`clicky-cursor ${effectiveSummoned ? 'summoned' : 'resting'}`}
        style={{ left: pos.x, top: pos.y, '--clicky-color': color } as React.CSSProperties}
      >
        <div
          className={`clicky-mini ${listening ? 'listening' : ''} ${
            effectiveSummoned && mode === 'smart' ? 'thinking' : ''
          }`}
        >
          <div className="clicky-burst-mini">
            <i />
            <i />
            <i />
            <i />
          </div>
          {listening && <span className="wave-ring" />}
        </div>
      </div>
    </>
  )
}

export default Clicky
