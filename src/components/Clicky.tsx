// Clicky.tsx — cursor companion + voice agent bubble
import React, { useState, useEffect, useRef } from 'react'
import { useClickyStore } from '../store/clickyStore'

export interface ClickyProps {
  enabled: boolean
  mode: 'smart' | 'ghost'
  target?: string        // external target override (from simulator steps)
  message?: { lead?: string; text: string; who?: string }  // external message override
  onDismiss?: () => void
  summoned: boolean
  setSummoned: (v: boolean) => void
  autoSummoned?: boolean
  color?: string
}

interface Pos { x: number; y: number }

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

function Clicky({
  enabled = true,
  mode = 'smart',
  target: propTarget,
  message: propMessage,
  onDismiss,
  summoned,
  setSummoned,
  autoSummoned = false,
  color = '#2046FF',
}: ClickyProps) {
  // Voice agent state from store
  const { listening, active, target: storeTarget, bubble, streaming, dismiss } = useClickyStore()

  // Resolve target: store (voice agent) takes priority, then prop
  const resolvedTarget = storeTarget ?? propTarget

  const cursorPos = useRef<Pos>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  })
  const homePos = useRef<Pos>({ x: -100, y: -100 })
  const followTarget = useRef<Pos>({ x: -100, y: -100 })

  const [anchorRect, setAnchorRect] = useState<{
    x: number; y: number; w: number; h: number; right: number; bottom: number
  } | null>(null)

  const prevMsgText = useRef<string | undefined>(undefined)
  const effectiveSummoned = summoned || autoSummoned || active
  const pos = useEasedFollow(followTarget, 0.22)

  // Speak prop-based message (simulator hints) when summoned
  useEffect(() => {
    const text = propMessage?.text
    if (text && text !== prevMsgText.current && effectiveSummoned && !active) {
      prevMsgText.current = text
      // Note: TTS for prop messages is handled externally
    }
    if (!effectiveSummoned) prevMsgText.current = undefined
  })

  // Track cursor
  useEffect(() => {
    if (!enabled) return
    const onMove = (e: MouseEvent) => {
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
    return () => { clearInterval(interval); window.removeEventListener('resize', update) }
  }, [])

  // Follow cursor when summoned, else rest
  useEffect(() => {
    let raf: number
    const tick = () => {
      followTarget.current = effectiveSummoned ? cursorPos.current : homePos.current
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [effectiveSummoned])

  // Anchor highlight to DOM target
  useEffect(() => {
    if (mode !== 'smart' || !resolvedTarget || !effectiveSummoned) {
      setAnchorRect(null)
      return
    }
    const update = () => {
      const el = document.querySelector<HTMLElement>(`[data-clicky-target="${resolvedTarget}"]`)
      if (!el) { setAnchorRect(null); return }
      const r = el.getBoundingClientRect()
      setAnchorRect({ x: r.left, y: r.top, w: r.width, h: r.height, right: r.right, bottom: r.bottom })
    }
    update()
    document.querySelectorAll('.main, .sim-main')
      .forEach(n => n.addEventListener('scroll', update, { passive: true }))
    window.addEventListener('resize', update)
    const interval = setInterval(update, 350)
    return () => {
      document.querySelectorAll('.main, .sim-main')
        .forEach(n => n.removeEventListener('scroll', update))
      window.removeEventListener('resize', update)
      clearInterval(interval)
    }
  }, [mode, resolvedTarget, effectiveSummoned])

  if (!enabled) return null

  // Determine bubble text and whether to show it
  const showVoiceBubble = active && bubble.length > 0
  const showPropBubble = !active && effectiveSummoned && anchorRect && propMessage
  const displayText = active ? bubble : (propMessage?.text ?? '')
  const displayLead = active ? undefined : propMessage?.lead
  const displayWho = active ? (listening ? 'слушаю…' : undefined) : propMessage?.who

  // Bubble placement
  let bubblePos: { x: number; y: number; side: 'right' | 'left' | 'bottom' | 'float' } | null = null

  if ((showVoiceBubble || showPropBubble) && displayText) {
    if (anchorRect) {
      const placeRight = anchorRect.right + 320 < window.innerWidth - 24
      const placeLeft = !placeRight && anchorRect.x - 320 > 24
      if (placeRight) {
        bubblePos = { x: anchorRect.right + 18, y: anchorRect.y + anchorRect.h / 2, side: 'right' }
      } else if (placeLeft) {
        bubblePos = { x: anchorRect.x - 18, y: anchorRect.y + anchorRect.h / 2, side: 'left' }
      } else {
        bubblePos = { x: anchorRect.x + anchorRect.w / 2, y: anchorRect.bottom + 18, side: 'bottom' }
      }
    } else if (showVoiceBubble) {
      // Floating fallback: anchor near cursor
      bubblePos = {
        x: Math.min(pos.x + 20, window.innerWidth - 340),
        y: Math.max(60, pos.y - 110),
        side: 'float',
      }
    }
  }

  const handleDismiss = () => {
    if (active) {
      dismiss()
    }
    onDismiss?.()
    setSummoned(false)
  }

  return (
    <>
      {/* Highlight box around anchored target */}
      {effectiveSummoned && anchorRect && (
        <div
          className="clicky-highlight"
          style={{ left: anchorRect.x - 6, top: anchorRect.y - 6, width: anchorRect.w + 12, height: anchorRect.h + 12 }}
        />
      )}

      {/* Bubble */}
      {bubblePos && displayText && (
        <div
          className={`clicky-bubble side-${bubblePos.side}`}
          style={{ left: bubblePos.x, top: bubblePos.y }}
          role="dialog"
        >
          <div className="who">
            <span className="live" style={{ background: color }} />
            {listening
              ? <>Клик · слушаю <span className="wave"><i/><i/><i/><i/><i/><i/></span></>
              : <>Клик{displayWho && ` · ${displayWho}`}</>
            }
          </div>
          {displayLead && <p style={{ fontWeight: 500, marginBottom: 4 }}>{displayLead}</p>}
          <p dangerouslySetInnerHTML={{ __html: displayText.replace(/\n/g, '<br/>') }} />
          {streaming && (
            <span style={{
              display: 'inline-block', marginLeft: 2,
              animation: 'clicky-blink .7s step-end infinite',
              color: color, opacity: 0.8,
            }}>▍</span>
          )}
          <div className="actions">
            <button className="pill muted" onClick={handleDismiss}>Понятно</button>
          </div>
        </div>
      )}

      {/* Cursor dot */}
      <div
        className={`clicky-cursor ${effectiveSummoned ? 'summoned' : 'resting'}`}
        style={{ left: pos.x, top: pos.y, '--clicky-color': color } as React.CSSProperties}
      >
        <div className={`clicky-mini ${listening ? 'listening' : ''} ${effectiveSummoned && mode === 'smart' ? 'thinking' : ''}`}>
          <div className="clicky-burst-mini"><i/><i/><i/><i/></div>
          {listening && <span className="wave-ring" />}
        </div>
      </div>
    </>
  )
}

export default Clicky
